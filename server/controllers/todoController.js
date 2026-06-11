const mongoose = require("mongoose");
const Todo = require("../models/Todo");

/**
 * @desc    Get all todos belonging to the authenticated user
 * @route   GET /api/todos
 * @access  Private
 */
const getTodos = async (req, res, next) => {
  try {
    const todos = await Todo.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

    res.json({ success: true, count: todos.length, data: todos });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new todo
 * @route   POST /api/todos
 * @access  Private
 */
const createTodo = async (req, res, next) => {
  try {
    // title is validated and trimmed by the createTodoRules middleware
    const todo = await Todo.create({
      title: req.body.title,
      userId: req.user.userId,
    });

    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a todo (title and/or completed)
 * @route   PUT /api/todos/:id
 * @access  Private
 */
const updateTodo = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid todo ID" });
    }

    const todo = await Todo.findById(id);

    if (!todo) {
      return res
        .status(404)
        .json({ success: false, message: "Todo not found" });
    }

    if (todo.userId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // title/completed are validated and normalized by updateTodoRules
    const { title, completed } = req.body;

    if (title !== undefined) todo.title = title;
    if (completed !== undefined) todo.completed = completed;

    const updatedTodo = await todo.save();

    res.json({ success: true, data: updatedTodo });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a todo
 * @route   DELETE /api/todos/:id
 * @access  Private
 */
const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid todo ID" });
    }

    const todo = await Todo.findById(id);

    if (!todo) {
      return res
        .status(404)
        .json({ success: false, message: "Todo not found" });
    }

    if (todo.userId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await todo.deleteOne();

    res.json({ success: true, message: "Todo deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete all completed todos for the authenticated user
 * @route   DELETE /api/todos/completed
 * @access  Private
 */
const clearCompleted = async (req, res, next) => {
  try {
    const result = await Todo.deleteMany({
      userId: req.user.userId,
      completed: true,
    });

    res.json({
      success: true,
      message: `${result.deletedCount} completed todo(s) deleted`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTodos, createTodo, updateTodo, deleteTodo, clearCompleted };
