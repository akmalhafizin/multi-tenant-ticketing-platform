/**
 * Seed script — creates a demo organization + admin user.
 *
 * Usage:
 *   npm run seed
 *
 * Prerequisites:
 *   - PostgreSQL running (docker compose up -d)
 *   - Migrations applied (npx prisma migrate dev)
 *   - apps/api/.env with DATABASE_URL set
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", "..", "..", "..", ".env") });
const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

async function main() {
  console.log("🌱  Seeding database...\n");

  // ── Organization ─────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: "rcl-engineering" },
    update: {},
    create: {
      name: "RCL Engineering & Facilities Sdn Bhd",
      slug: "rcl-engineering",
      welcomeMessage:
        "Welcome to RCL Engineering — report your facility issues here and our team will respond promptly.",
    },
  });
  console.log(`  ✓ Organization: ${org.name} (${org.slug})`);

  // ── Admin User ───────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("admin123", SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: org.id,
        email: "admin@rclengineering.com",
      },
    },
    update: {},
    create: {
      email: "admin@rclengineering.com",
      passwordHash,
      name: "Admin User",
      role: "OWNER",
      organizationId: org.id,
    },
  });
  console.log(`  ✓ Admin user: ${admin.email} / password: admin123`);

  // ── Agent User ───────────────────────────────────────────────
  const agentHash = await bcrypt.hash("agent123", SALT_ROUNDS);

  const agent = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: org.id,
        email: "agent@rclengineering.com",
      },
    },
    update: {},
    create: {
      email: "agent@rclengineering.com",
      passwordHash: agentHash,
      name: "Agent User",
      role: "AGENT",
      organizationId: org.id,
    },
  });
  console.log(`  ✓ Agent user: ${agent.email} / password: agent123`);

  // ── Categories ───────────────────────────────────────────────
  const categories = ["Mechanical & HVAC", "Electrical & Lighting", "Fire Protection", "Civil & General Works"];

  for (const name of categories) {
    await prisma.category.upsert({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name,
        },
      },
      update: {},
      create: { name, organizationId: org.id },
    });
  }
  console.log(`  ✓ ${categories.length} categories created`);

  // ── Default Roles ────────────────────────────────────────────
  const roleService = require("../services/roleService");
  const roles = await roleService.seedDefaults(org.id);
  console.log(`  ✓ ${roles.length} default roles created (Owner, Admin, Agent)`);

  // Link existing users to their matching role
  for (const role of roles) {
    const targetRole = role.name.toUpperCase();
    await prisma.user.updateMany({
      where: { organizationId: org.id, role: targetRole },
      data: { roleId: role.id },
    });
  }
  console.log(`  ✓ Users linked to their default roles`);

  console.log("\n✅  Seed complete!\n");
  console.log("  ┌──────────────────────────────┬──────────────┐");
  console.log("  │ Email                        │ Password     │");
  console.log("  ├──────────────────────────────┼──────────────┤");
  console.log("  │ admin@rclengineering.com     │ admin123     │");
  console.log("  │ agent@rclengineering.com     │ agent123     │");
  console.log("  └──────────────────────────────┴──────────────┘\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
