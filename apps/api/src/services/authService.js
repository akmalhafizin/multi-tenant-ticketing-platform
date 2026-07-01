const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("[FATAL] JWT_SECRET environment variable is not set");
}
const JWT_EXPIRES_IN = "8h";

/**
 * Authenticate a user by email + password.
 * When organizationSlug is provided, scopes the lookup to that tenant.
 * Returns { token, user } or throws.
 */
async function login(email, password, organizationSlug) {
  const where = { email };
  if (organizationSlug) {
    // Scope login to a specific tenant via subdomain
    const org = await prisma.organization.findUnique({
      where: { slug: organizationSlug },
    });
    if (!org) {
      const err = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }
    where.organizationId = org.id;
  }

  const user = await prisma.user.findFirst({
    where,
    include: {
      organization: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!user) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    organizationSlug: user.organization.slug,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organization: user.organization,
    },
  };
}

/**
 * Forgot-password: validate email exists and return a reset token.
 * (Email sending not implemented — just returns a token for now.)
 */
async function forgotPassword(email) {
  const user = await prisma.user.findFirst({
    where: { email },
    include: { organization: { select: { name: true } } },
  });

  if (!user) {
    // Return success even if not found to avoid email enumeration
    return { message: "If an account exists, a reset link has been sent." };
  }

  // In production: send email with reset link
  // For now, generate a short-lived JWT as the reset token
  const resetToken = jwt.sign(
    { userId: user.id, purpose: "password-reset" },
    JWT_SECRET,
    { expiresIn: "1h" },
  );

  console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);

  return { message: "If an account exists, a reset link has been sent." };
}

module.exports = { login, forgotPassword };
