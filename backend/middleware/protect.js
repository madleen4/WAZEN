const jwt = require("jsonwebtoken");

//  This middleware protects routes that require login
function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  //  Check if the request has a Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Not authorized, token missing"
    });
  }

  try {
    //  Extract token from "Bearer tokenHere"
    const token = authHeader.split(" ")[1];

    //  Verify token using JWT_SECRET from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  Save logged-in user info in req.user for other routes
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    // Continue to the actual route
    next();

  } catch (error) {
    return res.status(401).json({
      error: "Not authorized, invalid token"
    });
  }
}

module.exports = protect;