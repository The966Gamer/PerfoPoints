
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { PageLayout } from "@/components/layout/PageLayout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { UserDashboard } from "@/components/user/UserDashboard";

const Dashboard = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  return (
    <PageLayout requireAuth title={`Welcome, ${currentUser.username}!`}>
      {currentUser.role === "admin" ? (
        <AdminDashboard />
      ) : (
        <UserDashboard />
      )}
    </PageLayout>
  );
};

export default Dashboard;
