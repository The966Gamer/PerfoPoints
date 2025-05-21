
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomRequest } from '@/types';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

// Helper function for status icons
const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-amber-500" />;
  }
};

const RequestsPage = () => {
  const { currentUser } = useAuth();
  const { customRequests, fetchCustomRequests, reviewCustomRequest } = useData();
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchCustomRequests();
  }, [fetchCustomRequests]);

  const handleStatusUpdate = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    try {
      await reviewCustomRequest(requestId, newStatus);
      fetchCustomRequests(); // Refresh requests after update
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  // Filter requests based on the selected tab
  const filteredRequests = customRequests.filter(request => request.status === selectedTab);

  if (!currentUser) {
    return null;
  }

  return (
    <PageLayout requireAuth title="Your Requests">
      <div className="container mx-auto p-4">
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'pending' | 'approved' | 'rejected')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <RequestList
              requests={filteredRequests}
              currentUser={currentUser}
              handleStatusUpdate={handleStatusUpdate}
              selectedTab={selectedTab}
            />
          </TabsContent>
          
          <TabsContent value="approved">
            <RequestList
              requests={filteredRequests}
              currentUser={currentUser}
              handleStatusUpdate={handleStatusUpdate}
              selectedTab={selectedTab}
            />
          </TabsContent>
          
          <TabsContent value="rejected">
            <RequestList
              requests={filteredRequests}
              currentUser={currentUser}
              handleStatusUpdate={handleStatusUpdate}
              selectedTab={selectedTab}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

interface RequestListProps {
  requests: CustomRequest[];
  currentUser: any;
  handleStatusUpdate: (requestId: string, newStatus: 'approved' | 'rejected') => Promise<void>;
  selectedTab: string;
}

const RequestList: React.FC<RequestListProps> = ({ requests, currentUser, handleStatusUpdate, selectedTab }) => {
  return (
    <div className="grid gap-4">
      {requests.length > 0 ? (
        requests.map(request => (
          <div key={request.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{request.title}</h3>
              <div className="flex items-center space-x-2">
                {getStatusIcon(request.status)}
                <span className="text-sm text-gray-500">{request.status}</span>
              </div>
            </div>
            <p className="text-gray-600">{request.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              Requested by {currentUser.username} on {new Date(request.createdAt).toLocaleDateString()}
            </div>
            {currentUser.role === 'admin' && selectedTab === 'pending' && (
              <div className="mt-4 flex justify-end space-x-2">
                <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate(request.id, 'rejected')}>
                  Reject
                </Button>
                <Button size="sm" onClick={() => handleStatusUpdate(request.id, 'approved')}>
                  Approve
                </Button>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          No requests found with status "{selectedTab}".
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
