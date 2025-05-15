
import { ReactNode } from "react";
import { Header } from "./Header";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

interface PageLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  title?: string;
}

export function PageLayout({ 
  children, 
  requireAuth = false,
  requireAdmin = false,
  title 
}: PageLayoutProps) {
  const { currentUser } = useAuth();
  
  if (requireAuth && !currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="page-container">
          {title && (
            <h1 className="text-3xl font-bold tracking-tight mb-6">{title}</h1>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
