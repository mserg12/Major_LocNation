import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // Try to get token from cookies first
  let token = req.cookies?.token;
  
  // If not in cookies, try to get from Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' from the token
    }
  }

  if (!token) {
    console.log('No token found in cookies or Authorization header');
    return res.status(401).json({ message: "Not Authenticated!" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = payload.id;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(403).json({ message: "Invalid or expired token!" });
  }
};