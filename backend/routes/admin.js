const express = require("express");
const router = express.Router();
const { getDb } = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { logActivity, getActivity } = require("../data/activity");

router.use(requireAuth, requireAdmin);
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt, lastLoginAt: user.lastLoginAt };
}

router.get("/stats", async (req, res, next) => {
  try {
    const db = getDb();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [totalBooks, availableBooks, totalGenres, totalUsers, admins, members, recentSignups] = await Promise.all([
      db.collection("books").countDocuments(),
      db.collection("books").countDocuments({ available: true }),
      db.collection("books").distinct("genre"),
      db.collection("users").countDocuments(),
      db.collection("users").countDocuments({ role: "admin" }),
      db.collection("users").countDocuments({ role: "member" }),
      db.collection("users").countDocuments({ createdAt: { $gte: weekAgo } }),
    ]);
    res.json({ totalBooks, availableBooks, checkedOutBooks: totalBooks - availableBooks, totalGenres: totalGenres.length, totalUsers, admins, members, recentSignups });
  } catch (error) { next(error); }
});

router.get("/activity", async (req, res, next) => {
  try { res.json({ activity: await getActivity(parseInt(req.query.limit, 10) || 50) }); } catch (error) { next(error); }
});

router.get("/users", async (req, res, next) => {
  try {
    const users = await getDb().collection("users").find({}, { projection: { _id: 0, passwordHash: 0 } }).sort({ createdAt: 1 }).toArray();
    res.json({ users: users.map(publicUser) });
  } catch (error) { next(error); }
});

router.patch("/users/:id/role", async (req, res, next) => {
  try {
    const { role } = req.body || {};
    if (role !== "admin" && role !== "member") return res.status(400).json({ error: 'role must be "admin" or "member"' });
    const collection = getDb().collection("users");
    const user = await collection.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.id === req.user.id && role !== "admin") return res.status(400).json({ error: "You can't remove your own admin access" });
    await collection.updateOne({ id: user.id }, { $set: { role } });
    user.role = role;
    await logActivity("role_changed", `${req.user.name} set ${user.name}'s role to ${role}`, req.user);
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ error: "You can't delete your own account" });
    const collection = getDb().collection("users");
    const user = await collection.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    await collection.deleteOne({ id: user.id });
    await logActivity("user_deleted", `${req.user.name} removed the account for ${user.name}`, req.user);
    res.json({ ok: true });
  } catch (error) { next(error); }
});

module.exports = router;
