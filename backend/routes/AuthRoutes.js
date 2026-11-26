const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getMe
} = require("../controllers/AuthController");

const authenticate = require("../middleware/AuthMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

// Example protected route
// router.get("/me", authenticate, getMe);

module.exports = router;