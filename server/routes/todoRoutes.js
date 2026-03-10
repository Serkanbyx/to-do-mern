const express = require("express");
const verifyToken = require("../middleware/verifyToken");
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
router.post("/", createTodo);
router.delete("/completed", clearCompleted);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

module.exports = router;
