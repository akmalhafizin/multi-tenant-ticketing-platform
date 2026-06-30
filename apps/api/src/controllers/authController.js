const authService = require("../services/authService");

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Email and password are required",
      });
    }

    const result = await authService.login(email, password, req.tenantSlug);

    return res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err) {
    if (err.status === 401) {
      return res.status(401).json({
        success: false,
        data: null,
        error: err.message,
      });
    }
    next(err);
  }
}

/**
 * POST /api/auth/forgot-password
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Email is required",
      });
    }

    const result = await authService.forgotPassword(email);

    return res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
async function me(req, res) {
  const { userId } = req.user;
  const prisma = require("../lib/prisma");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      data: null,
      error: "User not found",
    });
  }

  return res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organization: user.organization,
    },
    error: null,
  });
}

module.exports = { login, forgotPassword, me };
