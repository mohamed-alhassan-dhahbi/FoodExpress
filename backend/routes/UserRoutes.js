const express = require("express");
const {
  validateProfileUpdate,
  validatePasswordChange
} = require("../middleware/ValidationMiddleware");
const router = express.Router();

const userController = require("../controllers/UserController");

const authenticate = require("../middleware/AuthMiddleware");
const authorizeRoles = require("../middleware/RoleMiddleware");

// ---------- Own profile (any logged-in user) ----------
// Keep these BEFORE "/:id", otherwise "me" is read as an id.
router.put("/me", authenticate, userController.updateMe);
router.put("/me/password", authenticate, userController.changePassword);

// ---------- Admin only ----------
router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  userController.getAllUsers
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  userController.getUserById
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  userController.updateUser
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("ADMIN"),
  userController.updateUserStatus
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  userController.deleteUser
);

router.put(
  "/me", 
  authenticate, 
  validateProfileUpdate, 
  userController.updateMe
);

router.put(
  "/me/password",
  authenticate,
  validatePasswordChange,
  userController.changePassword
);

module.exports = router;