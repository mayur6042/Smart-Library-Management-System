const bcrypt = require("bcryptjs");

// In-memory demo users. Passwords are hashed at startup so nothing plaintext
// ever sits in memory or gets logged. Matches the demo accounts shown on
// the login page: admin@library.demo / admin123, member@library.demo / member123
const users = [
  {
    id: "u1",
    name: "Admin",
    email: "admin@library.demo",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin",
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  },
  {
    id: "u2",
    name: "Member",
    email: "member@library.demo",
    passwordHash: bcrypt.hashSync("member123", 10),
    role: "member",
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  },
];

module.exports = users;
