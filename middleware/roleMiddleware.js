const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not have permission",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };
};

export default roleMiddleware; 