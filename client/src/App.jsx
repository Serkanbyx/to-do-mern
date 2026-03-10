import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: "0.875rem", borderRadius: "0.75rem" },
          success: { iconTheme: { primary: "#6366f1", secondary: "#fff" } },
        }}
      />

      <Navbar />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
