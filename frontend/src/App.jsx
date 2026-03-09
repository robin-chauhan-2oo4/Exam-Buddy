import { BrowserRouter, Routes, Route } from "react-router-dom";
// ✅ Swapped to Toastify for better z-index handling
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Documents from "./pages/document";
import ProtectedRoute from "./routes/protectedRoute";
import DocumentPage from "./pages/DocumentPage";
import ProfilePage from "./pages/ProfilePage";
import QuizHistoryPage from "./pages/QuizHistory"; // 👈 New Page
import AMAPage from "./pages/AMAPage"; // 👈 New Page
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      {/* ✅ Global Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        style={{ zIndex: 99999 }}
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Document Management */}
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />

        {/* Specific Document View */}
        <Route
          path="/document/:id"
          element={
            <ProtectedRoute>
              <DocumentPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ NEW: Quiz History Route */}
        <Route
          path="/quiz-history"
          element={
            <ProtectedRoute>
              <QuizHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ NEW: Ask Me Anything (AMA) Route */}
        <Route
          path="/ama"
          element={
            <ProtectedRoute>
              <AMAPage />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
