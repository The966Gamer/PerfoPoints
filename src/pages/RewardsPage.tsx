import { useState } from "react";
import { useData } from "@/context/DataContext";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { RewardCard } from "@/components/user/RewardCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

// Define request type explicitly to fix type error
type RequestType = 'reward' | 'task' | 'other';

const RewardsPage = () => {
  const { currentUser } = useAuth();
  const { rewards, addReward, createCustomRequest } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const navigate = useNavigate();
  
  // Form state for creating rewards
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointCost, setPointCost] = useState(50);
  const [approvalKeyRequired, setApprovalKeyRequired] = useState(true);
  
  // Form state for requesting new rewards/items
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [requestType, setRequestType] = useState<RequestType>("reward");
  
  const isAdmin = currentUser?.role === "admin";
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPointCost(50);
    setApprovalKeyRequired(true);
  };
  
  const resetRequestForm = () => {
    setRequestTitle("");
    setRequestDescription("");
    setRequestType("reward");
  };
  
  const handleAddReward = async () => {
    if (!title || !description || pointCost <= 0) return;
    
    await addReward({
      title,
      description,
      pointCost,
      approvalKeyRequired
    });
    
    resetForm();
    setIsAdding(false);
  };
  
  const handleCreateRequest = async () => {
    if (!requestTitle || !requestDescription) return;
    
    try {
      await createCustomRequest({
        title: requestTitle,
        description: requestDescription,
        type: requestType,
      });
      
      toast({
        title: "Request submitted!",
        description: "Your request has been sent to the admins.",
      });
      resetRequestForm();
      setIsRequesting(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Try again later.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <PageLayout requireAuth title="Rewards">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex space-x-2">
            <Dialog open={isRequesting} onOpenChange={setIsRequesting}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Request New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Something New</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="requestType">Request Type</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="reward"
                          name="requestType"
                          checked={requestType === "reward"}
                          onChange={() => setRequestType("reward")}
                          className="mr-2"
                        />
                        <Label htmlFor="reward">Reward</Label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="task"
                          name="requestType"
                          checked={requestType === "task"}
                          onChange={() => setRequestType("task")}
                          className="mr-2"
                        />
                        <Label htmlFor="task">Task</Label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="other"
                          name="requestType"
                          checked={requestType === "other"}
                          onChange={() => setRequestType("other")}
                          className="mr-2"
                        />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="requestTitle">Title</Label>
                    <Input
                      id="requestTitle"
                      value={requestTitle}
                      onChange={(e) => setRequestTitle(e.target.value)}
                      placeholder="What would you like?"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="requestDescription">Description</Label>
                    <Textarea
                      id="requestDescription"
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                      placeholder="Tell us more about it..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRequesting(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRequest}>Submit Request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {isAdmin && (
              <Dialog open={isAdding} onOpenChange={setIsAdding}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Reward
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Reward</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Reward title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Reward description"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pointCost">Point Cost</Label>
                      <Input
                        id="pointCost"
                        type="number"
                        min={1}
                        value={pointCost}
                        onChange={(e) => setPointCost(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="approvalRequired">Require admin approval</Label>
                      <Switch
                        id="approvalRequired"
                        checked={approvalKeyRequired}
                        onCheckedChange={setApprovalKeyRequired}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAdding(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddReward}>Create Reward</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rewards Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="approvalKey">Default approval key required</Label>
                    <Switch
                      id="approvalKey"
                      defaultChecked={true}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showCompleted">Show redeemed rewards</Label>
                    <Switch
                      id="showCompleted"
                      defaultChecked={true}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableGifting">Enable point gifting</Label>
                    <Switch
                      id="enableGifting"
                      defaultChecked={true}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button>Save Settings</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All Rewards</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="redeemed">Redeemed</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {rewards.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-lg font-medium mb-2">No rewards available</h3>
                <p className="text-muted-foreground">
                  {isAdmin 
                    ? "Click the 'Add Reward' button to create your first reward." 
                    : "There are no rewards available yet. Check back later!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.length > 0 ? rewards.map((reward) => (
                <RewardCard key={reward.id} reward={reward} />
              )) : (
                <div className="col-span-full text-center py-16">
                  <h3 className="text-lg font-medium mb-2">No rewards available</h3>
                  <p className="text-muted-foreground">
                    Check back later for new rewards!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="redeemed">
            <div className="text-center py-16">
              <h3 className="text-lg font-medium mb-2">No redeemed rewards</h3>
              <p className="text-muted-foreground">
                Rewards you've redeemed will appear here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default RewardsPage;
