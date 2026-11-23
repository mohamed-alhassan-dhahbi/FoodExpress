
const express = require("express");
const router = express.Router();

const userController = require("../controllers/UserController");

const authenticate = require("../middleware/AuthMiddleware");
const authorizeRoles = require("../middleware/RoleMiddleware");

// All users: ADMIN only
router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  userController.getAllUsers
);

// Get user by ID: ADMIN only
router.get(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  userController.getUserById
);

// Update user: ADMIN only
router.put(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  userController.updateUser
);

// Activate / Deactivate user: ADMIN only
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("ADMIN"),
  userController.updateUserStatus
);

// Delete user: ADMIN only
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  userController.deleteUser
);

module.exports = router;
