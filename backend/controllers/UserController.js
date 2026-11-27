const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Shared error handler: invalid ids give 400, duplicate emails 409
const handleError = (error, res, fallbackMessage) => {
  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID"
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Email already registered"
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  console.error(fallbackMessage, error);

  return res.status(500).json({
    success: false,
    message: fallbackMessage
  });
};

// ===================== OWN PROFILE =====================

// Update own profile (firstName, lastName, phone)
const updateMe = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const updates = {};

    if (firstName !== undefined) {
      if (typeof firstName !== "string" || !firstName.trim()) {
        return res.status(400).json({
          success: false,
          message: "First name cannot be empty"
        });
      }
      updates.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (typeof lastName !== "string" || !lastName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Last name cannot be empty"
        });
      }
      updates.lastName = lastName.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== "string" || !phone.trim()) {
        return res.status(400).json({
          success: false,
          message: "Phone number cannot be empty"
        });
      }
      updates.phone = phone.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    return handleError(error, res, "Server error while updating profile");
  }
};

// Change own password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 8 characters"
      });
    }

    // The password field is hidden by default in the model
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    const isSame = await bcrypt.compare(newPassword, user.password);

    if (isSame) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current one"
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    return handleError(error, res, "Server error while changing password");
  }
};

// ===================== ADMIN =====================

// Get all users
// Get all users (search, filters and pagination)
// Examples: /api/users?search=ali&role=CLIENT&isActive=true&page=2&limit=10
const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

    const { search, role, isActive } = req.query;
    const filter = {};

    // Search in first name, last name, email and phone
    if (typeof search === "string" && search.trim()) {
      // Escape regex characters so the search text is treated as plain text
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");

      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex }
      ];
    }

    // Filter by role
    if (role !== undefined) {
      if (!["CLIENT", "RESTAURANT", "ADMIN"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role filter"
        });
      }
      filter.role = role;
    }

    // Filter by account status
    if (isActive !== undefined) {
      if (isActive !== "true" && isActive !== "false") {
        return res.status(400).json({
          success: false,
          message: "isActive filter must be true or false"
        });
      }
      filter.isActive = isActive === "true";
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    return handleError(error, res, "Server error while retrieving users");
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return handleError(error, res, "Server error");
  }
};

// Update user information
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    // Only allow these fields to be updated
    const allowedUpdates = {};

    if (firstName !== undefined) allowedUpdates.firstName = firstName;
    if (lastName !== undefined) allowedUpdates.lastName = lastName;
    if (email !== undefined) allowedUpdates.email = email.toLowerCase().trim();
    if (phone !== undefined) allowedUpdates.phone = phone;

    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user
    });
  } catch (error) {
    return handleError(error, res, "Server error while updating user");
  }
};

// Activate / Deactivate user
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean"
      });
    }

    // An admin cannot deactivate their own account
    if (req.params.id === req.user.id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user
    });
  } catch (error) {
    return handleError(error, res, "Server error");
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    // An admin cannot delete their own account
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    return handleError(error, res, "Server error while deleting user");
  }
};

// Change a user's role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["CLIENT", "RESTAURANT", "ADMIN"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be CLIENT, RESTAURANT or ADMIN"
      });
    }

    // An admin cannot change their own role (avoids losing the last admin)
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: `User role changed to ${role}`,
      user
    });
  } catch (error) {
    return handleError(error, res, "Server error while changing role");
  }
};

module.exports = {
  updateMe,
  changePassword,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  updateUserRole,
  deleteUser
};