/**
 * @param {...string} allowedRoles
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role || 'user';
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      });
    }
    next();
  };
}
