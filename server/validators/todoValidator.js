const { body } = require("express-validator");

const MAX_TITLE_LENGTH = 200;

const createTodoRules = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: MAX_TITLE_LENGTH })
    .withMessage(`Title must be at most ${MAX_TITLE_LENGTH} characters`),
];

const updateTodoRules = [
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: MAX_TITLE_LENGTH })
    .withMessage(`Title must be at most ${MAX_TITLE_LENGTH} characters`),

  body("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be a boolean")
    .toBoolean(),
];

module.exports = { createTodoRules, updateTodoRules };
