import { memo, useCallback, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const TodoItem = ({ todo, onToggle, onDelete }) => {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = useCallback(async () => {
    setIsToggling(true);
    try {
      const { data } = await axiosInstance.put(`/todos/${todo._id}`, {
        completed: !todo.completed,
      });
      onToggle(data.data);
    } catch {
      /* error handled by interceptor */
    } finally {
      setIsToggling(false);
    }
  }, [todo._id, todo.completed, onToggle]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/todos/${todo._id}`);
      onDelete(todo._id);
    } catch {
      setIsDeleting(false);
    }
  }, [todo._id, onDelete]);

  return (
    <li
      className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition
        ${todo.completed ? "border-gray-100 bg-gray-50" : "border-gray-200 bg-white shadow-sm"}`}
    >
      <button
        type="button"
        aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        disabled={isToggling}
        onClick={handleToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition
          ${
            todo.completed
              ? "border-indigo-500 bg-indigo-500 text-white"
              : "border-gray-300 hover:border-indigo-400"
          }
          ${isToggling ? "opacity-50" : ""}`}
      >
        {todo.completed && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <span
        className={`flex-1 text-sm transition
          ${todo.completed ? "text-gray-400 line-through" : "text-gray-800"}`}
      >
        {todo.title}
      </span>

      <button
        type="button"
        aria-label="Delete todo"
        disabled={isDeleting}
        onClick={handleDelete}
        className={`rounded-lg p-1.5 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 focus:opacity-100 group-hover:opacity-100
          ${isDeleting ? "opacity-50" : ""}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </li>
  );
};

export default memo(TodoItem);
