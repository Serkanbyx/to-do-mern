import { memo, useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";

const TodoItem = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const inputRef = useRef(null);

  const handleToggle = useCallback(async () => {
    setIsToggling(true);
    try {
      const { data } = await axiosInstance.put(`/todos/${todo._id}`, {
        completed: !todo.completed,
      });
      onToggle(data.data);
      toast.success(data.data.completed ? "Marked as done!" : "Marked as undone!");
    } catch {
      toast.error("Failed to update todo.");
    } finally {
      setIsToggling(false);
    }
  }, [todo._id, todo.completed, onToggle]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/todos/${todo._id}`);
      onDelete(todo._id);
      toast.success("Todo deleted!");
    } catch {
      toast.error("Failed to delete todo.");
      setIsDeleting(false);
    }
  }, [todo._id, onDelete]);

  const startEditing = useCallback(() => {
    if (todo.completed) return;
    setEditTitle(todo.title);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [todo.completed, todo.title]);

  const saveEdit = useCallback(async () => {
    const trimmed = editTitle.trim();
    if (!trimmed) {
      setEditTitle(todo.title);
      setIsEditing(false);
      return;
    }
    if (trimmed === todo.title) {
      setIsEditing(false);
      return;
    }
    try {
      const { data } = await axiosInstance.put(`/todos/${todo._id}`, {
        title: trimmed,
      });
      onEdit(data.data);
      toast.success("Todo updated!");
    } catch {
      toast.error("Failed to update todo.");
      setEditTitle(todo.title);
    } finally {
      setIsEditing(false);
    }
  }, [editTitle, todo._id, todo.title, onEdit]);

  const handleEditKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveEdit();
      }
      if (e.key === "Escape") {
        setEditTitle(todo.title);
        setIsEditing(false);
      }
    },
    [saveEdit, todo.title],
  );

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

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleEditKeyDown}
          maxLength={200}
          className="min-w-0 flex-1 rounded-lg border border-indigo-300 bg-white px-2 py-1 text-sm text-gray-800 outline-none ring-2 ring-indigo-500/20"
        />
      ) : (
        <span
          onDoubleClick={startEditing}
          className={`flex-1 cursor-default text-sm transition select-none ${
            todo.completed
              ? "text-gray-400 line-through"
              : "text-gray-800 hover:text-indigo-600"
          }`}
          title={todo.completed ? "" : "Double-click to edit"}
        >
          {todo.title}
        </span>
      )}

      <button
        type="button"
        aria-label="Delete todo"
        disabled={isDeleting}
        onClick={handleDelete}
        className={`rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100
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
