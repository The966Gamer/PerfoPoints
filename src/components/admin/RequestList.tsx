
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Check, X, Clock, Image, FileText, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export function RequestList() {
  const { pointRequests: requests, reviewPointRequest, reviewCustomRequest, customRequests } = useData();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Fixed ReviewPointRequest to use the correct arguments and types
  const handleApproveRequest = async (request: any) => {
    try {
      // Ensure we have the correct parameters for reviewPointRequest
      const result = await reviewPointRequest(
        request.id,
        "approved",
        request.userId,
        request.taskId,
        request.pointValue || 0
      );
      
      if (result) {
        toast.success("Request approved successfully!");
      }
    } catch (error) {
      toast.error("Failed to approve request");
    }
  };
  
  const handleRejectRequest = async (request: any) => {
    try {
      // Ensure we have the correct parameters for reviewPointRequest
      const result = await reviewPointRequest(
        request.id,
        "rejected",
        request.userId,
        request.taskId,
        request.pointValue || 0
      );
      
      if (result) {
        toast.success("Request rejected successfully!");
      }
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };
  
  const handleApproveCustomRequest = async (requestId: string) => {
    try {
      // Fixed: use "approved" string instead of boolean
      await reviewCustomRequest(requestId, "approved");
      toast.success("Custom request approved successfully!");
    } catch (error) {
      toast.error("Failed to approve custom request");
    }
  };
  
  const handleRejectCustomRequest = async (requestId: string) => {
    try {
      // Fixed: use "rejected" string instead of boolean
      await reviewCustomRequest(requestId, "rejected");
      toast.success("Custom request rejected successfully!");
    } catch (error) {
      toast.error("Failed to reject custom request");
    }
  };

  const openImagePreview = (url: string) => {
    setImagePreview(url);
  };

  return (
    <Tabs defaultValue="points" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="points">
          <Badge variant="outline" className="mr-2">{
            requests.filter(req => req.status === "pending").length
          }</Badge>
          Point Requests
        </TabsTrigger>
        <TabsTrigger value="custom">
          <Badge variant="outline" className="mr-2">{
            customRequests.filter(req => req.status === "pending").length
          }</Badge>
          Custom Requests
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="points" className="mt-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2" /> 
          Point Requests
        </h3>
        
        {requests.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Requests</CardTitle>
              <CardDescription>There are no pending point requests at this time.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.filter(req => req.status === "pending").map((request) => (
              <Card key={request.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{request.username?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{request.username}</CardTitle>
                        <CardDescription className="text-xs mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(request.createdAt), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20">
                      +{request.pointValue} points
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <div className="mb-3">
                    <h4 className="font-medium">{request.taskTitle}</h4>
                    {request.comment && (
                      <div className="mt-2 text-sm text-muted-foreground border-l-2 border-muted pl-3 italic">
                        {request.comment}
                      </div>
                    )}
                  </div>
                  
                  {request.photoUrl && (
                    <div className="mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => openImagePreview(request.photoUrl as string)}
                      >
                        <Image className="h-4 w-4" />
                        View Photo Proof
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => handleApproveRequest(request)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => handleRejectRequest(request)}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="custom" className="mt-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2" /> 
          Custom Requests
        </h3>
        
        {customRequests.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Requests</CardTitle>
              <CardDescription>There are no pending custom requests at this time.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            {customRequests.filter(req => req.status === "pending").map((request) => (
              <Card key={request.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{request.username?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{request.username}</CardTitle>
                        <CardDescription className="text-xs mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(request.createdAt), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                      {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <div className="mb-3">
                    <h4 className="font-medium">{request.title}</h4>
                    {request.description && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {request.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => handleApproveCustomRequest(request.id)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => handleRejectCustomRequest(request.id)}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      
      {/* Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={(open) => !open && setImagePreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Proof Image</DialogTitle>
          </DialogHeader>
          {imagePreview && (
            <img 
              src={imagePreview} 
              alt="Proof"
              className="w-full rounded-md object-contain max-h-[80vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
