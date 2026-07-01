const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListBucketsCommand, CreateBucketCommand } = require("@aws-sdk/client-s3");

const ENDPOINT = process.env.S3_ENDPOINT || "http://localhost:9000";
const BUCKET = process.env.S3_BUCKET || "ticketing";
const REGION = process.env.S3_REGION || "us-east-1";
const ACCESS_KEY = process.env.S3_ACCESS_KEY || "minioadmin";
const SECRET_KEY = process.env.S3_SECRET_KEY || "minioadmin";

const client = new S3Client({
  endpoint: ENDPOINT,
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
  forcePathStyle: true, // required for MinIO
});

const ONE_YEAR = 365 * 24 * 60 * 60;

/**
 * Ensure the bucket exists (idempotent).
 */
async function ensureBucket() {
  try {
    const buckets = await client.send(new ListBucketsCommand({}));
    if (buckets.Buckets?.some((b) => b.Name === BUCKET)) {
      return; // already exists
    }
    await client.send(new CreateBucketCommand({ Bucket: BUCKET }));
    console.log(`[S3] Bucket "${BUCKET}" created`);
  } catch (err) {
    if (err.name?.includes("BucketAlready")) {
      return; // race condition, fine
    }
    console.error("[S3] Bucket setup error:", err.code, err.message);
  }
}

/**
 * Upload a file buffer to S3/MinIO.
 * @returns {{ key: string, url: string }}
 */
async function upload({ buffer, fileName, mimeType, orgId }) {
  const prefix = orgId ? `org_${orgId}/attachments` : "misc";
  const key = `${prefix}/${Date.now()}-${Math.round(Math.random() * 1e9)}${fileName.includes(".") ? fileName.substring(fileName.lastIndexOf(".")) : ""}`;

  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType || "application/octet-stream",
  }));

  return {
    key,
    url: `/uploads/${key}`,
  };
}

/**
 * Stream a file from S3/MinIO.
 * Returns the response object (with Body as a ReadableStream) or null.
 */
async function getFile(key) {
  try {
    return await client.send(new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }));
  } catch (err) {
    if (err.name === "NoSuchKey") return null;
    throw err;
  }
}

/**
 * Delete a file from S3/MinIO.
 */
async function remove(key) {
  await client.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));
}

/**
 * Upload a file directly at a specific key (used for branding assets).
 */
async function uploadRaw({ bucket, key, buffer, mimeType }) {
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType || "application/octet-stream",
  }));
}

module.exports = { ensureBucket, upload, getFile, remove, uploadRaw };
