const { Router } = require("express");
const { requestPasswordReset, resetPassword, changePassword } = require("../controller/passwordController");
const { authMiddleware } = require("../middleware/auth");

const router = Router();

// Public routes (no auth required)
router.post("/forgot", requestPasswordReset);
router.post("/reset", resetPassword);

// Protected routes (auth required)
router.post("/change", authMiddleware, changePassword);

module.exports = router;
