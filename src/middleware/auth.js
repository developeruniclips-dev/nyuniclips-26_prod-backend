const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded; // contains id, email, name, roles
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = { authMiddleware };
