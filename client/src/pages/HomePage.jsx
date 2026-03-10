import { useAuth } from "../context/AuthContext";
import TodoList from "../components/TodoList";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Organize your day — add, complete, or remove tasks below.
        </p>
      </header>

      <TodoList />
    </div>
  );
};

export default HomePage;
