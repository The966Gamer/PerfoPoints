
import { PageLayout } from "@/components/layout/PageLayout";
import RequestList from "@/components/admin/RequestList";

const RequestsPage = () => {
  return (
    <PageLayout requireAuth requireAdmin title="Point Requests">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <RequestList />
        </div>
      </div>
    </PageLayout>
  );
};

export default RequestsPage;
