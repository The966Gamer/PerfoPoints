
import { PageLayout } from "@/components/layout/PageLayout";
import RequestList from "@/components/admin/RequestList";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";

const RequestsPage = () => {
  const { theme } = useTheme();

  return (
    <PageLayout requireAuth requireAdmin title="Point Requests">
      <div className="space-y-6 mx-auto max-w-7xl px-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Task Completion Requests
        </h1>
        <p className="text-muted-foreground">
          Review and manage task completion requests from users.
        </p>
        
        <Card className={`
          p-6 rounded-xl 
          ${theme === 'dark' 
            ? 'bg-gray-800/60 backdrop-blur border-gray-700' 
            : 'bg-white/80 backdrop-blur shadow-md'
          }
        `}>
          <RequestList />
        </Card>
      </div>
    </PageLayout>
  );
};

export default RequestsPage;
