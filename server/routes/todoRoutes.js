const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const validate = require("../middleware/validate");
const { createTodoRules, updateTodoRules } = require("../validators/todoValidator");
const {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  clearCompleted,
} = require("../controllers/todoController");

const router = express.Router();

// All todo routes require authentication
router.use(verifyToken);

router.get("/", getTodos);
router.post("/", createTodoRules, validate, createTodo);
router.delete("/completed", clearCompleted);
router.put("/:id", updateTodoRules, validate, updateTodo);
router.delete("/:id", deleteTodo);

module.exports = router;
