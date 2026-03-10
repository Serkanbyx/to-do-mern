const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");
const { version } = require("./package.json");

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS — only allow requests from the frontend origin ─────────────
const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:5173"];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ── Security Middleware ──────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);
app.use(hpp());
app.use(mongoSanitize());

// ── Body Parsers ────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Routes ───────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// ── Welcome Page ────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>To-Do MERN API</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      background: #0f0f1a;
      color: #e2e8f0;
      overflow: hidden;
    }

    /* Subtle dot-grid background — productive workspace feel */
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background-image:
        radial-gradient(circle, rgba(99,102,241,.08) 1px, transparent 1px);
      background-size: 28px 28px;
      pointer-events: none;
    }

    /* Floating checkbox decorations */
    body::after {
      content: "";
      position: fixed;
      top: 12%;
      left: 8%;
      width: 22px;
      height: 22px;
      border: 2.5px solid rgba(99,102,241,.25);
      border-radius: 5px;
      transform: rotate(-12deg);
      pointer-events: none;
      box-shadow:
        60vw 6vh 0 0 rgba(129,140,248,.18),
        25vw 70vh 0 0 rgba(99,102,241,.15),
        75vw 55vh 0 0 rgba(129,140,248,.12),
        45vw 20vh 0 0 rgba(99,102,241,.10),
        85vw 80vh 0 0 rgba(129,140,248,.14);
    }

    .container {
      position: relative;
      text-align: center;
      padding: 3rem 2.5rem;
      max-width: 460px;
      width: 90%;
      background: rgba(26,26,46,.65);
      border: 1px solid rgba(99,102,241,.15);
      border-radius: 20px;
      backdrop-filter: blur(12px);
      box-shadow:
        0 0 60px rgba(99,102,241,.06),
        0 25px 50px rgba(0,0,0,.35);
    }

    /* Decorative checkmark above the title */
    .container::before {
      content: "";
      display: block;
      width: 38px;
      height: 38px;
      margin: 0 auto 1.2rem;
      border: 2.5px solid #6366f1;
      border-radius: 8px;
      position: relative;
      background:
        linear-gradient(135deg, transparent 40%, #6366f1 40%, #6366f1 45%, transparent 45%),
        linear-gradient(225deg, transparent 58%, #6366f1 58%, #6366f1 63%, transparent 63%);
    }

    h1 {
      font-size: 1.85rem;
      font-weight: 700;
      letter-spacing: -.02em;
      background: linear-gradient(135deg, #e2e8f0, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .version {
      margin-top: .5rem;
      font-size: .85rem;
      font-family: "Cascadia Code", "Fira Code", monospace;
      color: #6366f1;
      letter-spacing: .06em;
      opacity: .85;
    }

    /* Task-line decorative divider */
    .divider {
      width: 48px;
      height: 2px;
      margin: 1.5rem auto;
      background: linear-gradient(90deg, transparent, #6366f1, transparent);
      border-radius: 2px;
    }

    .links {
      display: flex;
      flex-direction: column;
      gap: .75rem;
      margin-top: .25rem;
    }

    .links a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: .45rem;
      padding: .7rem 1.6rem;
      border-radius: 10px;
      font-size: .9rem;
      font-weight: 500;
      text-decoration: none;
      transition: all .25s ease;
    }

    .btn-primary {
      background: #6366f1;
      color: #fff;
      border: 1px solid transparent;
      box-shadow: 0 4px 14px rgba(99,102,241,.3);
    }
    .btn-primary:hover {
      background: #818cf8;
      box-shadow: 0 6px 22px rgba(99,102,241,.45);
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: transparent;
      color: #a5b4fc;
      border: 1px solid rgba(99,102,241,.3);
    }
    .btn-secondary:hover {
      background: rgba(99,102,241,.08);
      border-color: #6366f1;
      color: #c7d2fe;
      transform: translateY(-2px);
    }

    .sign {
      margin-top: 2rem;
      padding-top: 1.2rem;
      border-top: 1px solid rgba(99,102,241,.1);
      font-size: .78rem;
      color: #64748b;
    }
    .sign a {
      color: #818cf8;
      text-decoration: none;
      transition: color .2s ease;
    }
    .sign a:hover { color: #a5b4fc; }

    @media (max-width: 480px) {
      .container { padding: 2rem 1.5rem; }
      h1 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>To-Do MERN API</h1>
    <p class="version">v${version}</p>
    <div class="divider"></div>
    <div class="links">
      <a href="https://to-do-mernn.netlify.app" class="btn-primary" target="_blank" rel="noopener noreferrer">Live App</a>
      <a href="https://github.com/Serkanbyx/s4.1_To-Do-Mern" class="btn-secondary" target="_blank" rel="noopener noreferrer">Source Code</a>
    </div>
    <footer class="sign">
      Created by
      <a href="https://serkanbayraktar.com/" target="_blank" rel="noopener noreferrer">Serkanby</a>
      |
      <a href="https://github.com/Serkanbyx" target="_blank" rel="noopener noreferrer">Github</a>
    </footer>
  </div>
</body>
</html>`);
});

// ── Global Error Handler ────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    success: false,
    message: isProduction ? "Something went wrong" : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

// ── Start Server ────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
