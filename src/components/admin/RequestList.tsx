
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
import { CheckCircle, Download, ExternalLink, ImageIcon, Loader2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";

interface RequestListProps {
  limit?: number;
}

const RequestList = ({ limit }: RequestListProps) => {
  const { requests, reviewPointRequest, customRequests, reviewCustomRequest } = useData();
  const { toast } = useToast();
  const { theme } = useTheme();
  
  const [processing, setProcessing] = useState<string | null>(null);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [currentProof, setCurrentProof] = useState<{
    id: string;
    imageUrl?: string | null;
    comment?: string | null;
    username: string;
    taskTitle: string;
  } | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [viewingFullscreen, setViewingFullscreen] = useState(false);

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
    setImageLoading(true);
    setImageLoadError(false);
    setCurrentProof({
      id: request.id,
      imageUrl: request.photoUrl,
      comment: request.comment,
      username: request.username,
      taskTitle: request.taskTitle
    });
    setShowProofDialog(true);
  };

  const downloadImage = () => {
    if (currentProof?.imageUrl) {
      // Open image in new tab
      window.open(currentProof.imageUrl, '_blank');
    }
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
          <TabsTrigger value="points" className="relative">
            Point Requests
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2 absolute -top-2 -right-2 h-5 min-w-[20px] flex items-center justify-center">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="custom" className="relative">
            Custom Requests
            {pendingCustomRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2 absolute -top-2 -right-2 h-5 min-w-[20px] flex items-center justify-center">
                {pendingCustomRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          <h2 className="text-xl font-semibold mb-4">Task Completion Requests</h2>
          {displayRequests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
              <ImageIcon className="mx-auto h-12 w-12 opacity-20 mb-2" />
              <p>No pending point requests</p>
              <p className="text-sm mt-1">All caught up! No requests need review.</p>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden border">
              <Table>
                <TableHeader className={theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}>
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
                  <AnimatePresence>
                    {displayRequests.map((request) => (
                      <motion.tr
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`
                          ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}
                          border-b border-gray-200 dark:border-gray-700 last:border-0
                        `}
                      >
                        <TableCell className="font-medium">{request.username}</TableCell>
                        <TableCell>{request.taskTitle}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="font-mono">
                            {request.pointValue}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(request.photoUrl || request.comment) ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="flex items-center gap-1 text-primary"
                              onClick={() => openProofDialog(request)}
                            >
                              {request.photoUrl ? (
                                <ImageIcon size={16} className="text-primary" />
                              ) : (
                                <ImageIcon size={16} className="text-muted-foreground" />
                              )}
                              View Proof
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(request.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                              onClick={() => handleDenyRequest(request.id)}
                              disabled={processing === request.id}
                            >
                              <XCircle className="h-5 w-5" />
                              <span className="sr-only">Deny</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={processing === request.id}
                            >
                              {processing === request.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <CheckCircle className="h-5 w-5" />
                              )}
                              <span className="sr-only">Approve</span>
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom">
          <h2 className="text-xl font-semibold mb-4">Custom Requests</h2>
          {displayCustomRequests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
              <div className="mx-auto h-12 w-12 opacity-20 mb-2 rounded-full border-2 border-dashed flex items-center justify-center">
                <span className="text-xl">+</span>
              </div>
              <p>No pending custom requests</p>
              <p className="text-sm mt-1">All custom requests have been reviewed.</p>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden border">
              <Table>
                <TableHeader className={theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {displayCustomRequests.map((request) => (
                      <motion.tr
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`
                          ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}
                          border-b border-gray-200 dark:border-gray-700 last:border-0
                        `}
                      >
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
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(request.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                              onClick={() => handleDenyCustomRequest(request.id)}
                              disabled={processing === request.id}
                            >
                              <XCircle className="h-5 w-5" />
                              <span className="sr-only">Deny</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon" 
                              className="text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                              onClick={() => handleApproveCustomRequest(request.id)}
                              disabled={processing === request.id}
                            >
                              {processing === request.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <CheckCircle className="h-5 w-5" />
                              )}
                              <span className="sr-only">Approve</span>
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog for showing proof */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className={`sm:max-w-2xl ${theme === 'dark' ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95'}`}>
          <DialogHeader>
            <DialogTitle>Task Completion Proof</DialogTitle>
            <DialogDescription>
              Submitted by <span className="font-medium">{currentProof?.username}</span> for task: <span className="font-medium">{currentProof?.taskTitle}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {currentProof?.imageUrl && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Photo Proof</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => setViewingFullscreen(!viewingFullscreen)}
                    >
                      <ExternalLink size={14} className="mr-1" />
                      {viewingFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={downloadImage}
                    >
                      <Download size={14} className="mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className={`
                  border rounded-md overflow-hidden bg-muted/30
                  ${viewingFullscreen ? 'max-h-[70vh]' : 'max-h-[400px]'}
                `}>
                  {imageLoading && (
                    <div className="flex items-center justify-center h-64 bg-muted/30">
                      <Loader2 className="h-8 w-8 animate-spin opacity-70" />
                    </div>
                  )}
                  
                  {imageLoadError ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-muted/30">
                      <ImageIcon size={48} className="opacity-20 mb-2" />
                      <p className="text-sm text-muted-foreground">Image failed to load</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => window.open(currentProof.imageUrl || "", "_blank")}
                      >
                        Open in new tab
                      </Button>
                    </div>
                  ) : (
                    <img 
                      src={currentProof.imageUrl || ""} 
                      alt="Proof" 
                      className={`w-full h-auto object-contain ${viewingFullscreen ? 'max-h-[70vh]' : 'max-h-[400px]'}`}
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageLoading(false);
                        setImageLoadError(true);
                      }}
                      style={{ display: imageLoading ? 'none' : 'block' }}
                    />
                  )}
                </div>
              </div>
            )}

            {currentProof?.comment && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">User Comment</h4>
                <div className={`p-4 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
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
                    {processing === currentProof.id ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="mr-2" />
                        Deny Request
                      </>
                    )}
                  </Button>
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApproveRequest(currentProof.id);
                      setShowProofDialog(false);
                    }}
                    disabled={processing === currentProof.id}
                  >
                    {processing === currentProof.id ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Approve Request
                      </>
                    )}
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
