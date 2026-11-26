const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getMe
} = require("../controllers/AuthController");

const authenticate = require("../middleware/AuthMiddleware");
const {
    validateRegister,
    validateLogin
} = require("../middleware/ValidationMiddleware");

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", authenticate, getMe);

module.exports = router;