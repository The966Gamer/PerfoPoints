
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestList } from "@/components/admin/RequestList";

const RequestsPage = () => {
  const { pointRequests, customRequests, reviewPointRequest, reviewCustomRequest } = useData();
  const [activeTab, setActiveTab] = useState("point-requests");

  const pendingPointRequests = pointRequests.filter(req => req.status === "pending");
  const completedPointRequests = pointRequests.filter(req => req.status !== "pending");
  
  const pendingCustomRequests = customRequests.filter(req => req.status === "pending");
  const completedCustomRequests = customRequests.filter(req => req.status !== "pending");

  return (
    <PageLayout requireAdmin title="Manage Requests">
      <Tabs defaultValue="point-requests" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="point-requests">Point Requests</TabsTrigger>
          <TabsTrigger value="custom-requests">Custom Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="point-requests" className="space-y-6 mt-6">
          {/* Point requests content */}
          {/* Use imported RequestList component here */}
        </TabsContent>
        
        <TabsContent value="custom-requests" className="space-y-6 mt-6">
          {/* Custom requests content */}
          {/* Use imported RequestList component here */}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default RequestsPage;
