const express = require("express");
const rateLimit = require("express-rate-limit");
const { registerRules, loginRules } = require("../validators/authValidator");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// Max 10 requests per 15 minutes per IP on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again after 15 minutes",
  },
});

router.post("/register", authLimiter, registerRules, register);
router.post("/login", authLimiter, loginRules, login);

module.exports = router;
