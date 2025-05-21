
import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, ClipboardList, Gift, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RequestsPage() {
  const { currentUser } = useAuth();
  const { 
    submitCustomRequest, 
    fetchCustomRequests,
    customRequests
  } = useData();

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'task' | 'reward'>('task');
  const [activeTab, setActiveTab] = useState('my-requests');

  useEffect(() => {
    fetchCustomRequests();
  }, [fetchCustomRequests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error("Please enter a title");
      return;
    }

    try {
      await submitCustomRequest({
        title,
        description,
        type,
        status: 'pending'
      });
      
      setIsCreating(false);
      setTitle('');
      setDescription('');
      toast.success(`Your ${type} request has been submitted!`);
    } catch (error: any) {
      toast.error(`Failed to submit request: ${error.message}`);
    }
  };

  // Filter requests based on active tab
  const filteredRequests = customRequests.filter(request => {
    if (activeTab === 'my-requests') {
      return request.userId === currentUser?.id;
    }
    return true;
  });

  // Group requests by status
  const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
  const approvedRequests = filteredRequests.filter(r => r.status === 'approved');
  const rejectedRequests = filteredRequests.filter(r => r.status === 'rejected');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <ClipboardList className="h-4 w-4" />;
      case 'reward': return <Gift className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <PageLayout requireAuth title="Requests">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Requests</h1>
            <p className="text-muted-foreground">Request new tasks or rewards</p>
          </div>
          
          <Button onClick={() => setIsCreating(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        <Tabs defaultValue="my-requests" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="all-requests">All Requests</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="my-requests" className="space-y-4 mt-6">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No requests yet</h3>
                <p className="text-muted-foreground mt-2">
                  Create a new request to suggest a task or reward
                </p>
                <Button className="mt-4" onClick={() => setIsCreating(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </div>
            ) : (
              <>
                {pendingRequests.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      Pending Requests
                    </h2>
                    {pendingRequests.map(request => (
                      <RequestCard key={request.id} request={request} />
                    ))}
                  </div>
                )}
                
                {approvedRequests.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Approved Requests
                    </h2>
                    {approvedRequests.map(request => (
                      <RequestCard key={request.id} request={request} />
                    ))}
                  </div>
                )}
                
                {rejectedRequests.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      Rejected Requests
                    </h2>
                    {rejectedRequests.map(request => (
                      <RequestCard key={request.id} request={request} />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          {currentUser?.role === 'admin' && (
            <TabsContent value="all-requests" className="space-y-4 mt-6">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium">No requests yet</h3>
                  <p className="text-muted-foreground">
                    No users have submitted any requests yet
                  </p>
                </div>
              ) : (
                <>
                  {pendingRequests.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-medium flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        Pending Requests
                      </h2>
                      {pendingRequests.map(request => (
                        <RequestCard key={request.id} request={request} isAdmin />
                      ))}
                    </div>
                  )}
                  
                  {approvedRequests.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-medium flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Approved Requests
                      </h2>
                      {approvedRequests.map(request => (
                        <RequestCard key={request.id} request={request} isAdmin />
                      ))}
                    </div>
                  )}
                  
                  {rejectedRequests.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-medium flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        Rejected Requests
                      </h2>
                      {rejectedRequests.map(request => (
                        <RequestCard key={request.id} request={request} isAdmin />
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      {/* Create Request Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Request</DialogTitle>
            <DialogDescription>
              Request a new task or reward to be added to the system
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="request-type">Request Type</Label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as 'task' | 'reward')}
                >
                  <SelectTrigger id="request-type">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="reward">Reward</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder={`Enter ${type} title`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder={`Describe what you'd like this ${type} to be`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

interface RequestCardProps {
  request: {
    id: string;
    userId: string;
    title: string;
    description: string;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  isAdmin?: boolean;
}

function RequestCard({ request, isAdmin = false }: RequestCardProps) {
  const { reviewCustomRequest } = useData();
  const [isReviewing, setIsReviewing] = useState(false);
  
  const handleApprove = async () => {
    try {
      setIsReviewing(true);
      await reviewCustomRequest(request.id, 'approved');
      toast.success(`Request approved successfully!`);
    } catch (error) {
      toast.error(`Failed to approve request`);
    } finally {
      setIsReviewing(false);
    }
  };
  
  const handleReject = async () => {
    try {
      setIsReviewing(true);
      await reviewCustomRequest(request.id, 'rejected');
      toast.success(`Request rejected`);
    } catch (error) {
      toast.error(`Failed to reject request`);
    } finally {
      setIsReviewing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {request.type === 'task' ? 
                <ClipboardList className="h-4 w-4" /> : 
                <Gift className="h-4 w-4" />
              }
              {request.title}
            </CardTitle>
            <CardDescription>
              {new Date(request.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          
          <Badge 
            variant={
              request.status === 'approved' ? 'success' : 
              request.status === 'rejected' ? 'destructive' : 
              'outline'
            }
            className="flex items-center gap-1"
          >
            {getStatusIcon(request.status)}
            {request.status === 'pending' ? 'Pending' : 
             request.status === 'approved' ? 'Approved' : 'Rejected'}
          </Badge>
        </div>
      </CardHeader>
      
      {request.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{request.description}</p>
        </CardContent>
      )}
      
      {isAdmin && request.status === 'pending' && (
        <CardFooter className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReject}
            disabled={isReviewing}
          >
            <XCircle className="h-4 w-4 mr-1" /> 
            Reject
          </Button>
          <Button 
            size="sm" 
            onClick={handleApprove}
            disabled={isReviewing}
          >
            <CheckCircle className="h-4 w-4 mr-1" /> 
            Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
