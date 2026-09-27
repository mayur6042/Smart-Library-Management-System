require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { connectDatabase } = require("./db");

const booksRouter = require("./routes/books");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const libraryRouter = require("./routes/library");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/books", booksRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/library", libraryRouter);

// Login is the landing page — index.html and admin.html each guard
// themselves client-side (see js/guard.js) and bounce back here if there's
// no valid session, but "/" itself should never show the catalog first.
app.get("/", (req, res) => res.redirect("/login.html"));

// Serves index.html / login.html / admin.html / js/* if you drop them in /public.
// index: false so "/" always hits the redirect above instead of auto-serving index.html.
app.use(express.static(path.join(__dirname, "public"), { index: false }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 4000;

connectDatabase()
  .then(() => app.listen(PORT, () => console.log(`Open Stacks API running on http://localhost:${PORT}`)))
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exitCode = 1;
  });
