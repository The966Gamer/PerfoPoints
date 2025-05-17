
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

import { DataProvider } from "@/context/DataContext";
import { AuthProvider } from "@/context/AuthContext";

import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import ProfilePage from "@/pages/ProfilePage";
import TasksPage from "@/pages/TasksPage";
import RewardsPage from "@/pages/RewardsPage";
import UsersPage from "@/pages/UsersPage";
import RequestsPage from "@/pages/RequestsPage";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";

import "@/App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="perfopoints-theme">
      <Router>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <SonnerToaster position="bottom-right" />
          </DataProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
