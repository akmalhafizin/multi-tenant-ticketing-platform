# Deployment Guide

This guide covers deploying the multi-tenant ticketing platform on a **NAS** (Synology/QNAP/TrueNAS) or **VPS** (DigitalOcean/Linode/AWS).

---

## Architecture Overview (Production)

```
                          ┌─────────────────┐
                          │   Cloudflare     │
                          │   Tunnel / DNS   │
                          └────────┬────────┘
                                   │
                          ┌────────┴────────┐
                          │   Nginx/Caddy   │  ← reverse proxy (VPS only)
                          │   (optional)    │
                          └────────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
             ┌──────┴──────┐ ┌────┴────┐ ┌───────┴──────┐
             │  Node.js    │ │  MinIO  │ │ PostgreSQL  │
             │  (Express)  │ │  (S3)   │ │  (DB)       │
             └──────┬──────┘ └─────────┘ └──────────────┘
                    │
             ┌──────┴──────┐
             │  Built      │
             │  Frontend   │
             │  (static)   │
             └─────────────┘
```

**Key difference from dev:** In production, you build the frontend to static files and serve them from Express. No Vite dev server needed.

---

## Option A: NAS Deployment (Synology / QNAP / TrueNAS)

Best for self-hosted, always-on, local network access.

### 1. Prerequisites

- Docker & Docker Compose installed on your NAS
- Ports available: 3001 (API), 9000 (MinIO API), 9001 (MinIO UI)
- A shared folder for persistent data (e.g. `/volume1/docker/ticketing`)

### 2. Create project directories

```bash
# On your NAS via SSH
mkdir -p /volume1/docker/ticketing/data/postgres
mkdir -p /volume1/docker/ticketing/data/minio
mkdir -p /volume1/docker/ticketing/apps/api/uploads
```

### 3. Upload project files

Copy the project to your NAS using SCP, rsync, or Git clone:

```bash
# From your dev machine
rsync -avz --exclude node_modules --exclude .git \
  /path/to/multi-tenant-ticketing-platform/ \
  user@nas:/volume1/docker/ticketing/
```

### 4. Configure docker-compose for NAS

Create `docker-compose.prod.yml` or modify `docker-compose.yml`:

```yaml
version: "3.9"

services:
  db:
    image: postgres:15
    container_name: ticketing-db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ticketing
    ports:
      - "5432:5432"
    volumes:
      - /volume1/docker/ticketing/data/postgres:/var/lib/postgresql/data

  minio:
    image: minio/minio:latest
    container_name: ticketing-storage
    restart: always
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - /volume1/docker/ticketing/data/minio:/data

  api:
    image: node:24-slim
    container_name: ticketing-api
    restart: always
    depends_on:
      - db
      - minio
    working_dir: /app
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      DATABASE_URL: "postgresql://postgres:${DB_PASSWORD}@db:5432/ticketing"
      JWT_SECRET: ${JWT_SECRET}
      FRONTEND_URL: "https://your-domain.com"
      S3_ENDPOINT: "http://minio:9000"
      S3_BUCKET: ticketing
      S3_ACCESS_KEY: ${MINIO_USER}
      S3_SECRET_KEY: ${MINIO_PASSWORD}
    volumes:
      - /volume1/docker/ticketing/apps/api:/app
```

### 5. Create .env file

```bash
# /volume1/docker/ticketing/.env
DB_PASSWORD=strong-password-here
JWT_SECRET=change-this-to-random-string
MINIO_USER=minioadmin
MINIO_PASSWORD=strong-minio-password
DOMAIN=your-domain.com
```

### 6. Build and start

```bash
cd /volume1/docker/ticketing

# Install dependencies
docker compose run --rm api npm install

# Run migrations
docker compose run --rm api npx prisma migrate deploy

# Seed database (first time only)
docker compose run --rm api npm run seed

# Start everything
docker compose up -d
```

### 7. Access

- API: `http://nas-ip:3001`
- MinIO Console: `http://nas-ip:9001`
- Frontend (if built): `http://nas-ip:3001`

---

## Option B: VPS Deployment (Docker Compose)

Best for public-facing, custom domain, production use.

### 1. VPS Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose (if needed)
apt install docker-compose-plugin
```

### 2. Clone and configure

```bash
git clone https://github.com/your-repo/multi-tenant-ticketing-platform.git
cd multi-tenant-ticketing-platform

cp .env.example .env
nano .env   # fill in your secrets
```

### 3. Production docker-compose

Use the sample in section A step 4, but with proper secrets and domain.

### 4. Set up SSL with Caddy or Nginx Proxy Manager

**Using Caddy (simplest — automatic SSL):**

Create `Caddyfile`:

```
your-domain.com {
    reverse_proxy api:3001
}
```

Add Caddy to `docker-compose.yml`:

```yaml
  caddy:
    image: caddy:2
    container_name: ticketing-caddy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
```

**Using Nginx:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 25M;
}
```

### 5. Start

```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## Option C: VPS Deployment (Bare Metal — No Docker)

Best for minimal resource usage, single-server deployment.

### 1. Install dependencies

```bash
# Node.js 24+
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install nodejs postgresql nginx certbot

# PostgreSQL setup
sudo -u postgres psql -c "CREATE USER ticketing WITH PASSWORD 'strong-password';"
sudo -u postgres psql -c "CREATE DATABASE ticketing OWNER ticketing;"
```

### 2. Install MinIO

```bash
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# Create MinIO user and data dir
sudo useradd -r minio -s /sbin/nologin
sudo mkdir -p /data/minio
sudo chown minio:minio /data/minio

# Create systemd service (/etc/systemd/system/minio.service)
cat > /etc/systemd/system/minio.service << 'EOF'
[Unit]
Description=MinIO Object Storage
After=network.target

[Service]
User=minio
ExecStart=/usr/local/bin/minio server /data/minio --console-address ":9001"
Environment="MINIO_ROOT_USER=minioadmin"
Environment="MINIO_ROOT_PASSWORD=strong-minio-password"
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable minio
sudo systemctl start minio
```

### 3. Deploy the application

```bash
# Clone and setup
cd /opt
git clone https://github.com/your-repo/multi-tenant-ticketing-platform.git
cd multi-tenant-ticketing-platform

# Backend
cd apps/api
npm install --production
cp ../../.env.example .env
nano .env   # set DATABASE_URL, JWT_SECRET, MINIO creds

# Run migrations
npx prisma migrate deploy

# Seed (first time)
npm run seed

# Build frontend
cd ../web
npm install
npm run build   # outputs dist/
```

### 4. Set up Express to serve the built frontend

Add to `apps/api/src/index.js` (already handled if you build):

```javascript
// Serve built frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../web/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../web/dist/index.html"));
  });
}
```

### 5. Run with PM2 (process manager)

```bash
npm install -g pm2

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ticketing-api',
    cwd: '/opt/multi-tenant-ticketing-platform/apps/api',
    script: 'src/index.js',
    env: { NODE_ENV: 'production' },
    max_memory_restart: '500M',
    error_file: '/var/log/ticketing/error.log',
    out_file: '/var/log/ticketing/out.log',
  }]
};
EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup   # auto-start on boot
```

### 6. Set up Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend + API — Express handles both
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase upload limit
    client_max_body_size 25M;
}
```

### 7. SSL with Certbot

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

### 8. Verify

```bash
pm2 status
curl -s http://localhost:3001/    # should return API running message
curl -s https://your-domain.com   # should serve the frontend
```

---

## Production Checklist

| Item | Done? |
|------|-------|
| Change all default passwords | ☐ |
| Generate strong JWT_SECRET (`openssl rand -hex 32`) | ☐ |
| Set NODE_ENV=production | ☐ |
| Disable CORS for production (or lock to your domain) | ☐ |
| Set up regular DB backups | ☐ |
| Set up MinIO backups | ☐ |
| Configure firewall (only open 80/443) | ☐ |
| Set up monitoring (uptime, disk, memory) | ☐ |
| Use Cloudflare Tunnel instead of opening ports | ☐ |

### Recommended: Cloudflare Tunnel (no open ports)

If you don't want to expose ports directly, use Cloudflare Tunnel:

```bash
# Install on VPS
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# Authenticate and create tunnel
cloudflared tunnel login
cloudflared tunnel create ticketing

# Route domain to tunnel
cloudflared tunnel route dns ticketing your-domain.com

# Run tunnel pointing to local Express
cloudflared tunnel run ticketing
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | Secret for signing JSON Web Tokens |
| `FRONTEND_URL` | ✅ | — | Public URL for invite/tracking links |
| `S3_ENDPOINT` | ❌ | `http://localhost:9000` | MinIO / S3 endpoint |
| `S3_BUCKET` | ❌ | `ticketing` | S3 bucket name |
| `S3_ACCESS_KEY` | ❌ | `minioadmin` | S3 access key |
| `S3_SECRET_KEY` | ❌ | `minioadmin` | S3 secret key |
| `S3_REGION` | ❌ | `us-east-1` | S3 region (required by SDK) |
| `PORT` | ❌ | `3001` | Express listen port |

---

## Directory Structure (Production)

```
/opt/multi-tenant-ticketing-platform/
├── apps/
│   ├── api/
│   │   ├── node_modules/
│   │   ├── prisma/              # schema + migrations
│   │   ├── src/                 # backend code
│   │   └── package.json
│   └── web/
│       ├── dist/                # built frontend (production)
│       ├── src/                 # source (dev only)
│       └── package.json
├── data/                         # persistent data (on NAS volume)
│   ├── postgres/
│   └── minio/
├── docker-compose.yml
└── .env
```

---

## Backup Strategy

### PostgreSQL
```bash
# Daily backup
pg_dump -U postgres ticketing > /backups/ticketing-$(date +%Y%m%d).sql

# Keep last 7 days
find /backups -name "*.sql" -mtime +7 -delete
```

### MinIO
```bash
# Use mc client
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mirror local/ticketing /backups/minio/

# Or use rclone for cloud backup
rclone sync /data/minio s3:backup-bucket/ticketing/
```

### Add to cron
```bash
crontab -e
# Daily at 2AM
0 2 * * * /usr/local/bin/backup-ticketing.sh
```
