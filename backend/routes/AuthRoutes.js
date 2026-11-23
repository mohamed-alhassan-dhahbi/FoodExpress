const express = require("express");
const router = express.Router();

const {
    register,
    login
} = require("../controllers/AuthController");

const authenticate = require("../middleware/AuthMiddleware");

router.post("/register", register);
router.post("/login", login);

// Example protected route
// router.get("/me", authenticate, getMe);

module.exports = router;