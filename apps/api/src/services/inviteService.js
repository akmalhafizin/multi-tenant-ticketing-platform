const prisma = require("../lib/prisma");

const INVITE_EXPIRY_HOURS = 48;

/**
 * Create an invite for a new staff member.
 */
async function create({ email, role, invitedByUserId, organizationId }) {
  if (!email || !email.trim()) {
    const err = new Error("Email is required");
    err.status = 400;
    throw err;
  }

  // Check if user already exists in this org
  const existingUser = await prisma.user.findFirst({
    where: { email: email.trim(), organizationId },
  });
  if (existingUser) {
    const err = new Error("A user with this email already exists in this organization");
    err.status = 409;
    throw err;
  }

  // Check for existing PENDING invite for same email in this org
  const pendingInvite = await prisma.organizationInvite.findFirst({
    where: { organizationId, email: email.trim(), status: "PENDING" },
  });
  if (pendingInvite) {
    const err = new Error("A pending invite already exists for this email");
    err.status = 409;
    throw err;
  }

  const validRoles = ["ADMIN", "AGENT"];
  const finalRole = validRoles.includes(role) ? role : "AGENT";

  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

  const invite = await prisma.organizationInvite.create({
    data: {
      email: email.trim(),
      role: finalRole,
      organizationId,
      invitedByUserId,
      expiresAt,
    },
    include: {
      organization: { select: { name: true } },
    },
  });

  return invite;
}

/**
 * List all invites for an organization.
 */
async function list(organizationId) {
  return prisma.organizationInvite.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      acceptedAt: true,
      createdAt: true,
    },
  });
}

/**
 * Revoke a pending invite.
 */
async function revoke(inviteId, organizationId) {
  const invite = await prisma.organizationInvite.findFirst({
    where: { id: inviteId, organizationId },
  });
  if (!invite) {
    const err = new Error("Invite not found");
    err.status = 404;
    throw err;
  }
  if (invite.status !== "PENDING") {
    const err = new Error("Only pending invites can be revoked");
    err.status = 400;
    throw err;
  }

  return prisma.organizationInvite.update({
    where: { id: inviteId },
    data: { status: "REVOKED" },
  });
}

/**
 * Get an invite by token (public — no auth).
 */
async function getByToken(token) {
  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
    },
  });
  if (!invite) {
    const err = new Error("Invite not found");
    err.status = 404;
    throw err;
  }
  if (invite.status !== "PENDING") {
    const err = new Error("This invite has already been used or revoked");
    err.status = 400;
    throw err;
  }
  if (invite.expiresAt < new Date()) {
    const err = new Error("This invite has expired");
    err.status = 400;
    throw err;
  }

  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    organizationName: invite.organization.name,
    organizationSlug: invite.organization.slug,
  };
}

/**
 * Accept an invite — creates the User account.
 */
async function accept(token, { name, password }) {
  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
  });
  if (!invite) {
    const err = new Error("Invite not found");
    err.status = 404;
    throw err;
  }
  if (invite.status !== "PENDING") {
    const err = new Error("This invite has already been used or revoked");
    err.status = 400;
    throw err;
  }
  if (invite.expiresAt < new Date()) {
    const err = new Error("This invite has expired");
    err.status = 400;
    throw err;
  }

  if (!name || !name.trim()) {
    const err = new Error("Name is required");
    err.status = 400;
    throw err;
  }
  if (!password || password.length < 6) {
    const err = new Error("Password must be at least 6 characters");
    err.status = 400;
    throw err;
  }

  const bcrypt = require("bcryptjs");
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: invite.email,
      name: name.trim(),
      role: invite.role,
      passwordHash,
      organizationId: invite.organizationId,
    },
  });

  // Mark invite as accepted
  await prisma.organizationInvite.update({
    where: { id: invite.id },
    data: { status: "ACCEPTED", acceptedAt: new Date() },
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

module.exports = { create, list, revoke, getByToken, accept };
