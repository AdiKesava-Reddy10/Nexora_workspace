const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'nexora_workspace_secret_key_2026_secure';

const authMiddleware = {
  // Validate token and attach user payload to request
  authenticate(req, res, next) {
    let token = null;

    // Check Authorization Header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check Cookies if header is absent
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied. No authentication token provided.'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Contains id, email, role
      next();
    } catch (error) {
      console.warn('JWT Verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.'
      });
    }
  },

  // Authorize specific user roles
  authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized. User not authenticated.'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden. Role '${req.user.role}' does not have permission to access this resource.`
        });
      }

      next();
    };
  }
};

module.exports = authMiddleware;
