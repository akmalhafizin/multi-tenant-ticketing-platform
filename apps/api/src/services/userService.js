const prisma = require("../lib/prisma");

/**
 * List all users in an organization.
 * Excludes passwordHash from results.
 */
async function list(organizationId) {
  return prisma.user.findMany({
    where: { organizationId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Change a user's role.
 * Only OWNER can do this. Cannot change the last OWNER.
 */
async function updateRole(userId, newRole, actorId, organizationId) {
  const target = await prisma.user.findFirst({
    where: { id: userId, organizationId },
  });
  if (!target) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  // Cannot change your own role
  if (target.id === actorId) {
    const err = new Error("You cannot change your own role");
    err.status = 400;
    throw err;
  }

  // If demoting an OWNER, ensure there's at least one other OWNER left
  if (target.role === "OWNER" && newRole !== "OWNER") {
    const ownerCount = await prisma.user.count({
      where: { organizationId, role: "OWNER" },
    });
    if (ownerCount <= 1) {
      const err = new Error(
        "Cannot demote the last OWNER. Promote another user first."
      );
      err.status = 400;
      throw err;
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
}

/**
 * Remove a user from the organization.
 * OWNER and ADMIN can remove AGENT users.
 * Only OWNER can remove ADMIN users.
 * Cannot remove yourself. Cannot remove the last OWNER.
 */
async function remove(userId, actorId, actorRole, organizationId) {
  const target = await prisma.user.findFirst({
    where: { id: userId, organizationId },
  });
  if (!target) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  // Cannot remove yourself
  if (target.id === actorId) {
    const err = new Error("You cannot remove yourself");
    err.status = 400;
    throw err;
  }

  // ADMIN can only remove AGENT users
  if (actorRole === "ADMIN" && target.role !== "AGENT") {
    const err = new Error(
      "Admins can only remove users with AGENT role"
    );
    err.status = 403;
    throw err;
  }

  // Cannot remove the last OWNER
  if (target.role === "OWNER") {
    const ownerCount = await prisma.user.count({
      where: { organizationId, role: "OWNER" },
    });
    if (ownerCount <= 1) {
      const err = new Error(
        "Cannot remove the last OWNER. Promote another user first."
      );
      err.status = 400;
      throw err;
    }
  }

  await prisma.user.delete({ where: { id: userId } });
}

module.exports = { list, updateRole, remove };
