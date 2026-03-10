import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import TodoItem from "./TodoItem";
import Spinner from "./Spinner";

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const { data } = await axiosInstance.get("/todos");
        setTodos(data.data);
      } catch {
        toast.error("Failed to load todos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const handleAdd = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = newTitle.trim();
      if (!trimmed) return;

      setIsAdding(true);

      try {
        const { data } = await axiosInstance.post("/todos", { title: trimmed });
        setTodos((prev) => [data.data, ...prev]);
        setNewTitle("");
        toast.success("Todo added!");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to add todo.");
      } finally {
        setIsAdding(false);
      }
    },
    [newTitle],
  );

  const handleToggle = useCallback((updatedTodo) => {
    setTodos((prev) =>
      prev.map((t) => (t._id === updatedTodo._id ? updatedTodo : t)),
    );
  }, []);

  const handleDelete = useCallback((deletedId) => {
    setTodos((prev) => prev.filter((t) => t._id !== deletedId));
  }, []);

  const completedCount = todos.filter((t) => t.completed).length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="What needs to be done?"
          maxLength={200}
          className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="submit"
          disabled={isAdding || !newTitle.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
        >
          {isAdding && <Spinner size="sm" className="border-white border-t-transparent" />}
          {isAdding ? "Adding…" : "Add"}
        </button>
      </form>

      {todos.length > 0 && (
        <p className="text-xs text-gray-400">
          {completedCount}/{todos.length} completed
        </p>
      )}

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
