import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });

    req.user = decoded.id;   // always user ID
    next();
  });
};
