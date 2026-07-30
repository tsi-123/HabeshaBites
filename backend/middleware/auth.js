import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return res.json({ success: false, message: "Not Authorized Login Again" });
  }
  if (!process.env.JWT_SECRET) {
    return res.json({ success: false, message: "Server misconfiguration" });
  }
  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    // GET requests have no body — ensure req.body exists before assigning userId
    if (!req.body || typeof req.body !== "object") {
      req.body = {};
    }
    req.body.userId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Invalid or expired token" });
  }
};
export default authMiddleware;
