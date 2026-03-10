import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import TodoItem from "./TodoItem";
import Spinner from "./Spinner";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [filter, setFilter] = useState("all");

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

  const handleEdit = useCallback((updatedTodo) => {
    setTodos((prev) =>
      prev.map((t) => (t._id === updatedTodo._id ? updatedTodo : t)),
    );
  }, []);

  const handleDelete = useCallback((deletedId) => {
    setTodos((prev) => prev.filter((t) => t._id !== deletedId));
  }, []);

  const handleClearCompleted = useCallback(async () => {
    setIsClearing(true);
    try {
      const { data } = await axiosInstance.delete("/todos/completed");
      setTodos((prev) => prev.filter((t) => !t.completed));
      toast.success(data.message);
    } catch {
      toast.error("Failed to clear completed todos.");
    } finally {
      setIsClearing(false);
    }
  }, []);

  const completedCount = todos.filter((t) => t.completed).length;

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

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
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                  filter === key
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400">
              {completedCount}/{todos.length} completed
            </p>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={handleClearCompleted}
                disabled={isClearing}
                className="text-xs font-medium text-red-400 transition hover:text-red-600 disabled:opacity-50"
              >
                {isClearing ? "Clearing…" : "Clear completed"}
              </button>
            )}
          </div>
        </div>
      )}

      {todos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-400">
            No todos yet. Add your first task above!
          </p>
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-400">
            No {filter === "active" ? "active" : "completed"} todos.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoList;
