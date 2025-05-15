
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
import { CheckCircle, XCircle } from "lucide-react";

const RequestList = () => {
  const { requests, reviewPointRequest, customRequests, reviewCustomRequest } = useData();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleApproveRequest = async (requestId: string) => {
    try {
      setProcessing(requestId);
      await reviewPointRequest(requestId, true);
    } finally {
      setProcessing(null);
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    try {
      setProcessing(requestId);
      await reviewPointRequest(requestId, false);
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveCustomRequest = async (requestId: string) => {
    try {
      setProcessing(requestId);
      await reviewCustomRequest(requestId, true);
    } finally {
      setProcessing(null);
    }
  };

  const handleDenyCustomRequest = async (requestId: string) => {
    try {
      setProcessing(requestId);
      await reviewCustomRequest(requestId, false);
    } finally {
      setProcessing(null);
    }
  };

  const pendingRequests = requests.filter(
    (request) => request.status === "pending"
  );
  const pendingCustomRequests = customRequests.filter(
    (request) => request.status === "pending"
  );

  return (
    <div>
      <Tabs defaultValue="points" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="points">Point Requests</TabsTrigger>
          <TabsTrigger value="custom">Custom Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          <h2 className="text-xl font-semibold mb-4">Task Completion Requests</h2>
          {pendingRequests.length === 0 ? (
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
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.username}</TableCell>
                    <TableCell>{request.taskTitle}</TableCell>
                    <TableCell className="text-right">{request.pointValue}</TableCell>
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
                          <CheckCircle className="text-green-600 h-5 w-5" />
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
          {pendingCustomRequests.length === 0 ? (
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
                {pendingCustomRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.username}</TableCell>
                    <TableCell className="capitalize">{request.type}</TableCell>
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
                          <CheckCircle className="text-green-600 h-5 w-5" />
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
    </div>
  );
};

export default RequestList;
