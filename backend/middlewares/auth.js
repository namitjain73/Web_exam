import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header)
    return res.status(401).json({ message: "No token provided" });

  const token = header.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: "Invalid token" });

    req.user = decoded;
    next(); // ← yahi required hota hai
  });
};
