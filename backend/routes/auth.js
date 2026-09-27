const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { getDb } = require("../db");
const { requireAuth, SECRET } = require("../middleware/auth");
const { logActivity } = require("../data/activity");

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt, lastLoginAt: user.lastLoginAt };
}

function signToken(user) { return jwt.sign({ sub: user.id }, SECRET, { expiresIn: "7d" }); }

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const user = await getDb().collection("users").findOne({ email: String(email).toLowerCase() });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) return res.status(401).json({ error: "Check your email and password and try again" });
    user.lastLoginAt = new Date().toISOString();
    await getDb().collection("users").updateOne({ id: user.id }, { $set: { lastLoginAt: user.lastLoginAt } });
    await logActivity("login", `${user.name} logged in`, user);
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    const normalizedEmail = String(email).toLowerCase();
    if (await getDb().collection("users").findOne({ email: normalizedEmail })) return res.status(409).json({ error: "An account with that email already exists" });
    const now = new Date().toISOString();
    const user = { id: "u" + Date.now(), name, email: normalizedEmail, passwordHash: bcrypt.hashSync(password, 10), role: "member", createdAt: now, lastLoginAt: now };
    await getDb().collection("users").insertOne(user);
    await logActivity("register", `${user.name} created an account`, user);
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.get("/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
router.post("/logout", (req, res) => res.json({ ok: true }));

module.exports = router;
