import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Tab } from '@headlessui/react';
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
  const { customRequests, fetchCustomRequests, updateCustomRequest } = useData();
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchCustomRequests();
  }, [fetchCustomRequests]);

  const handleStatusUpdate = async (requestId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await updateCustomRequest(requestId, { status: newStatus });
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
        <Tab.Group selectedIndex={['pending', 'approved', 'rejected'].indexOf(selectedTab)} onChange={(index) => setSelectedTab(['pending', 'approved', 'rejected'][index] as 'pending' | 'approved' | 'rejected')}>
          <Tab.List className="flex space-x-4 mb-6">
            <Tab className={({ selected }) =>
              `rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary
              ${selected
                ? 'bg-primary text-primary-foreground shadow'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`
            }>
              Pending
            </Tab>
            <Tab className={({ selected }) =>
              `rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary
              ${selected
                ? 'bg-primary text-primary-foreground shadow'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`
            }>
              Approved
            </Tab>
            <Tab className={({ selected }) =>
              `rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary
              ${selected
                ? 'bg-primary text-primary-foreground shadow'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`
            }>
              Rejected
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <RequestList
                requests={filteredRequests}
                currentUser={currentUser}
                handleStatusUpdate={handleStatusUpdate}
                selectedTab={selectedTab}
              />
            </Tab.Panel>
            <Tab.Panel>
              <RequestList
                requests={filteredRequests}
                currentUser={currentUser}
                handleStatusUpdate={handleStatusUpdate}
                selectedTab={selectedTab}
              />
            </Tab.Panel>
            <Tab.Panel>
              <RequestList
                requests={filteredRequests}
                currentUser={currentUser}
                handleStatusUpdate={handleStatusUpdate}
                selectedTab={selectedTab}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </PageLayout>
  );
};

interface RequestListProps {
  requests: CustomRequest[];
  currentUser: any;
  handleStatusUpdate: (requestId: string, newStatus: string) => Promise<void>;
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
