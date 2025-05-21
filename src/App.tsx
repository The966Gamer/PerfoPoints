
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";

import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import AuthCallback from "@/pages/AuthCallback";
import ProfilePage from "@/pages/ProfilePage";
import RequestsPage from "@/pages/RequestsPage";
import TasksPage from "@/pages/TasksPage";
import RewardsPage from "@/pages/RewardsPage";
import UsersPage from "@/pages/UsersPage";
import AchievementsPage from "@/pages/AchievementsPage";

import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            <Toaster position="top-center" richColors />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
