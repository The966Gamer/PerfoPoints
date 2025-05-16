
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, Image, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface RequestListProps {
  limit?: number;
}

const RequestList = ({ limit }: RequestListProps) => {
  const { requests, reviewPointRequest, customRequests, reviewCustomRequest } = useData();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [currentProof, setCurrentProof] = useState<{
    id: string;
    imageUrl?: string | null;
    comment?: string | null;
    username: string;
    taskTitle: string;
  } | null>(null);

  const handleApproveRequest = async (requestId: string) => {
    try {
      setProcessing(requestId);
      await reviewPointRequest(requestId, true);
      toast({
        title: "Request approved",
        description: "Points have been awarded to the user"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    try {
      setProcessing(requestId);
      await reviewPointRequest(requestId, false);
      toast({
        title: "Request denied",
        description: "The request has been denied"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveCustomRequest = async (requestId: string) => {
    try {
      setProcessing(requestId);
      await reviewCustomRequest(requestId, true);
      toast({
        title: "Request approved",
        description: "Custom request has been approved"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleDenyCustomRequest = async (requestId: string) => {
    try {
      setProcessing(requestId);
      await reviewCustomRequest(requestId, false);
      toast({
        title: "Request denied",
        description: "Custom request has been denied"
      });
    } finally {
      setProcessing(null);
    }
  };

  const openProofDialog = (request: any) => {
    setCurrentProof({
      id: request.id,
      imageUrl: request.photoUrl,
      comment: request.comment,
      username: request.username,
      taskTitle: request.taskTitle
    });
    setShowProofDialog(true);
  };

  const pendingRequests = requests.filter(
    (request) => request.status === "pending"
  );
  
  const displayRequests = limit ? pendingRequests.slice(0, limit) : pendingRequests;
  
  const pendingCustomRequests = customRequests.filter(
    (request) => request.status === "pending"
  );
  
  const displayCustomRequests = limit ? pendingCustomRequests.slice(0, limit) : pendingCustomRequests;

  return (
    <div>
      <Tabs defaultValue="points" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="points">Point Requests</TabsTrigger>
          <TabsTrigger value="custom">Custom Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          <h2 className="text-xl font-semibold mb-4">Task Completion Requests</h2>
          {displayRequests.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No pending point requests
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.username}</TableCell>
                    <TableCell>{request.taskTitle}</TableCell>
                    <TableCell className="text-right">{request.pointValue}</TableCell>
                    <TableCell>
                      {(request.photoUrl || request.comment) ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="flex items-center gap-1 text-primary"
                          onClick={() => openProofDialog(request)}
                        >
                          <Image size={16} />
                          View Proof
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(request.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDenyRequest(request.id)}
                          disabled={processing === request.id}
                        >
                          <XCircle className="text-destructive h-5 w-5" />
                          <span className="sr-only">Deny</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApproveRequest(request.id)}
                          disabled={processing === request.id}
                        >
                          <CheckCircle className="text-success h-5 w-5" />
                          <span className="sr-only">Approve</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="custom">
          <h2 className="text-xl font-semibold mb-4">Custom Requests</h2>
          {displayCustomRequests.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No pending custom requests
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayCustomRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.username}</TableCell>
                    <TableCell className="capitalize">
                      <Badge variant={request.type === 'task' ? 'default' : 'secondary'}>
                        {request.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {request.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(request.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDenyCustomRequest(request.id)}
                          disabled={processing === request.id}
                        >
                          <XCircle className="text-destructive h-5 w-5" />
                          <span className="sr-only">Deny</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApproveCustomRequest(request.id)}
                          disabled={processing === request.id}
                        >
                          <CheckCircle className="text-success h-5 w-5" />
                          <span className="sr-only">Approve</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog for showing proof */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Task Completion Proof</DialogTitle>
            <DialogDescription>
              Submitted by {currentProof?.username} for task: {currentProof?.taskTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {currentProof?.imageUrl && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Photo Proof</h4>
                <div className="border rounded-md overflow-hidden bg-muted/30">
                  <img 
                    src={currentProof.imageUrl} 
                    alt="Proof" 
                    className="w-full h-auto object-contain max-h-[400px]" 
                  />
                </div>
              </div>
            )}

            {currentProof?.comment && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Comment</h4>
                <div className="p-3 rounded-md bg-muted/30 text-sm">
                  {currentProof.comment}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowProofDialog(false)}
              >
                Close
              </Button>
              
              {currentProof && (
                <>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      handleDenyRequest(currentProof.id);
                      setShowProofDialog(false);
                    }}
                    disabled={processing === currentProof.id}
                  >
                    Deny Request
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      handleApproveRequest(currentProof.id);
                      setShowProofDialog(false);
                    }}
                    disabled={processing === currentProof.id}
                  >
                    Approve Request
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestList;
