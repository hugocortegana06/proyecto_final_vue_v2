// middleware/requireAdmin.js
exports.requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Acceso denegado, se requiere rol de administrador' });
    }
  };
  