const prisma = require("../lib/prisma");

/**
 * Extract the org slug from the request.
 *
 * Priority:
 *   1. X-Org-Slug header (set by frontend for public API calls)
 *   2. Subdomain of the Host header (for direct API access via subdomain)
 *
 * Returns null if no slug can be determined.
 */
function extractSlug(req) {
  // Explicit header — frontend injects this
  const headerSlug = req.headers["x-org-slug"];
  if (headerSlug) return headerSlug;

  // Subdomain from Host header — for direct API access
  const host = req.headers.host;
  if (host) {
    const parts = host.split(":")[0].split(".");
    // Host like "rcl-engineering.lvh.me" or "rcl-engineering.localhost"
    if (parts.length >= 3) {
      const slug = parts[0];
      // Skip common prefixes that aren't org slugs
      if (!["www", "app", "api", "admin"].includes(slug)) {
        return slug;
      }
    }
  }

  return null;
}

/**
 * Middleware that resolves the tenant from subdomain.
 * Attaches the organization to req.tenant.
 * For authenticated routes, also verifies the JWT's org matches.
 */
async function resolveTenant(req, res, next) {
  try {
    const slug = extractSlug(req);

    if (slug) {
      const org = await prisma.organization.findUnique({
        where: { slug },
        select: { id: true, name: true, slug: true, welcomeMessage: true, defaultCategoryId: true },
      });

      if (org) {
        req.tenant = org;
        req.tenantSlug = slug;
      }
    }

    // For authenticated routes, verify tenant matches JWT
    if (req.user && req.tenant) {
      if (req.user.organizationId !== req.tenant.id) {
        return res.status(403).json({
          success: false,
          data: null,
          error: "Organization mismatch — your account does not belong to this tenant",
        });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { resolveTenant, extractSlug };
