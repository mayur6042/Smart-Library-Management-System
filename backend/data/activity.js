const { getDb } = require("../db");

async function logActivity(type, message, actor) {
  const entry = {
    id: `a${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type, // "login" | "register" | "book_created" | "book_updated" | "book_deleted" | "availability" | "role_changed" | "user_deleted"
    message,
    actor: actor ? { id: actor.id, name: actor.name, email: actor.email } : null,
    timestamp: new Date().toISOString(),
  };
  await getDb().collection("activity").insertOne(entry);
  return entry;
}

async function getActivity(limit = 50) {
  return getDb().collection("activity")
    .find({}, { projection: { _id: 0 } })
    .sort({ timestamp: -1 })
    .limit(Math.max(1, Math.min(limit, 200)))
    .toArray();
}

module.exports = { logActivity, getActivity };
