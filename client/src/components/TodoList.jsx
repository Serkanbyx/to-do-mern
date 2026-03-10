import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import TodoItem from "./TodoItem";

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  /* ── Fetch all todos on mount ── */
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const { data } = await axiosInstance.get("/todos");
        setTodos(data.data);
      } catch {
        setError("Failed to load todos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, []);

  /* ── Add a new todo ── */
  const handleAdd = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = newTitle.trim();
      if (!trimmed) return;

      setIsAdding(true);
      setError("");

      try {
        const { data } = await axiosInstance.post("/todos", { title: trimmed });
        setTodos((prev) => [data.data, ...prev]);
        setNewTitle("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to add todo.");
      } finally {
        setIsAdding(false);
      }
    },
    [newTitle],
  );

  /* ── Toggle completed state ── */
  const handleToggle = useCallback((updatedTodo) => {
    setTodos((prev) =>
      prev.map((t) => (t._id === updatedTodo._id ? updatedTodo : t)),
    );
  }, []);

  /* ── Delete a todo ── */
  const handleDelete = useCallback((deletedId) => {
    setTodos((prev) => prev.filter((t) => t._id !== deletedId));
  }, []);

  /* ── Stats ── */
  const completedCount = todos.filter((t) => t.completed).length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Add form ── */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="What needs to be done?"
          maxLength={200}
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="submit"
          disabled={isAdding || !newTitle.trim()}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
        >
          {isAdding ? "Adding…" : "Add"}
        </button>
      </form>

      {/* ── Error message ── */}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* ── Stats bar ── */}
      {todos.length > 0 && (
        <p className="text-xs text-gray-400">
          {completedCount}/{todos.length} completed
        </p>
      )}

      {/* ── Todo list ── */}
      {todos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-400">
            No todos yet. Add your first task above!
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoList;
