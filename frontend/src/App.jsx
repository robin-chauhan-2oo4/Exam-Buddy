import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Documents from "./pages/document";
import ProtectedRoute from "./routes/protectedRoute";
import DocumentPage from "./pages/DocumentPage";
import SummaryViewPage from "./pages/SummaryViewPage";
import ProfilePage from "./pages/ProfilePage";
import QuizHistoryPage from "./pages/QuizHistory";
import AMAPage from "./pages/AMAPage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastClassName={() =>
            "relative flex p-1 min-h-[60px] rounded-2xl justify-between overflow-hidden cursor-pointer mt-4 shadow-2xl backdrop-blur-md glass border border-white/10"
          }
          bodyClassName={() => "text-sm font-semibold flex items-center p-3 text-white"}
          progressClassName={"bg-indigo-500"}
          style={{ zIndex: 999999, top: "20px" }}
        />

        <Routes>
          {/* Root redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
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
          
          <Route
            path="/document/:id/summary/:summaryId"
            element={
              <ProtectedRoute>
                <SummaryViewPage />
              </ProtectedRoute>
            }
          />

          {/* Quiz History Route */}
          <Route
            path="/quiz-history"
            element={
              <ProtectedRoute>
                <QuizHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Ask Me Anything (AMA) Route */}
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
    </ThemeProvider>
  );
}
