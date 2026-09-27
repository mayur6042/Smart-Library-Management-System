const jwt = require("jsonwebtoken");
const { getDb } = require("../db");

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const payload = jwt.verify(token, SECRET);
    const user = await getDb().collection("users").findOne({ id: payload.sub });
    if (!user) return res.status(401).json({ error: "Not logged in" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Session expired, log in again" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admins only" });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, SECRET };
