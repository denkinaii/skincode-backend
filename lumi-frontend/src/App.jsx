import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/Toast";

import Splash from "./pages/Splash";
import Register from "./pages/Register";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import AppLayout from "./pages/app/AppLayout"; // якщо AppLayout всередині підпапки app

// Захищений роутер: якщо юзер не авторизований — редирект на головну
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <div className="app-container">
              <Routes>
                <Route path="/" element={<Splash />} />
                <Route path="/register" element={<Register />} />
                
                {/* Захищені маршрути */}
                <Route path="/quiz" element={
                  <ProtectedRoute><Quiz /></ProtectedRoute>
                } />
                <Route path="/results" element={
                  <ProtectedRoute><Results /></ProtectedRoute>
                } />
                <Route path="/app/*" element={
                  <ProtectedRoute><AppLayout /></ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}