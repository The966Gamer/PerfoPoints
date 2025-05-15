
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
import { Plus } from "lucide-react";

const RewardsPage = () => {
  const { currentUser } = useAuth();
  const { rewards, addReward } = useData();
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state for creating rewards
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointCost, setPointCost] = useState(50);
  const [approvalKeyRequired, setApprovalKeyRequired] = useState(true);
  
  const isAdmin = currentUser?.role === "admin";
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPointCost(50);
    setApprovalKeyRequired(true);
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
  
  return (
    <PageLayout requireAuth title="Rewards">
      <div className="space-y-6">
        {isAdmin && (
          <div className="flex justify-end">
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
          </div>
        )}
        
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
      </div>
    </PageLayout>
  );
};

export default RewardsPage;
