const { body, validationResult } = require("express-validator");

// Returns 400 with the first error message (and the full list) if a rule fails
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }

  next();
};

// Reusable rules
const nameRule = (field, label) =>
  body(field)
    .isString().withMessage(`${label} is required`)
    .trim()
    .notEmpty().withMessage(`${label} is required`)
    .isLength({ max: 50 }).withMessage(`${label} must not exceed 50 characters`);

const phoneRule = () =>
  body("phone")
    .isString().withMessage("Phone number is required")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^\+?[0-9]{8,15}$/)
    .withMessage("Phone number must contain 8 to 15 digits");

const passwordRule = (field = "password") =>
  body(field)
    .isString().withMessage("Password is required")
    .isLength({ min: 8, max: 64 })
    .withMessage("Password must contain between 8 and 64 characters")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a digit");

// ---------- Rule sets ----------
const validateRegister = [
  nameRule("firstName", "First name"),
  nameRule("lastName", "Last name"),
  body("email")
    .isString().withMessage("Email is required")
    .trim()
    .isEmail().withMessage("Email is not valid")
    .normalizeEmail({ gmail_remove_dots: false }),
  phoneRule(),
  passwordRule("password"),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password confirmation does not match"),
  handleValidation
];

const validateLogin = [
  body("email").isString().trim().isEmail().withMessage("Email is not valid"),
  body("password").isString().notEmpty().withMessage("Password is required"),
  handleValidation
];

const validateProfileUpdate = [
  body("firstName").optional().isString().trim().notEmpty()
    .withMessage("First name cannot be empty"),
  body("lastName").optional().isString().trim().notEmpty()
    .withMessage("Last name cannot be empty"),
  body("phone").optional().isString().trim()
    .matches(/^\+?[0-9]{8,15}$/)
    .withMessage("Phone number must contain 8 to 15 digits"),
  handleValidation
];

const validatePasswordChange = [
  body("currentPassword").isString().notEmpty()
    .withMessage("Current password is required"),
  passwordRule("newPassword"),
  handleValidation
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange
};