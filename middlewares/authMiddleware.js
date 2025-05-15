import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Authorization token missing");
  }

  try {
    const decoded = jwt.verify(token, "your_secret_key");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send("Invalid or expired token");
  }
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    const { role } = req.user;
    if (!roles.includes(role)) {
      return res.status(403).send("Access denied");
    }

    next();
  };
};
