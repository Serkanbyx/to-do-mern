import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h2 className="text-2xl font-bold text-gray-900">
        Welcome, {user?.name}
      </h2>
      <p className="mt-2 text-gray-500">
        Your tasks will appear here.
      </p>
    </div>
  );
};

export default HomePage;
