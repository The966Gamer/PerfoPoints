
import { useState } from "react";
import { Reward } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Lock, ShieldCheck, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { RedemptionSuccessDialog } from "@/components/ui/RedemptionSuccessDialog";

interface RewardCardProps {
  reward: Reward;
}

export function RewardCard({ reward }: RewardCardProps) {
  const { redeemReward, updateReward, deleteReward, fetchAllRewards } = useData();
  const { currentUser } = useAuth();
  const [redeeming, setRedeeming] = useState(false);
  
  // Success dialog state
  const [showSuccess, setShowSuccess] = useState(false);
  const [redemptionInfo, setRedemptionInfo] = useState({ pointsSpent: 0, remainingPoints: 0 });
  
  // Edit dialog state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(reward.title);
  const [editDescription, setEditDescription] = useState(reward.description);
  const [editPointCost, setEditPointCost] = useState(reward.pointCost);
  const [editCategory, setEditCategory] = useState(reward.category || "general");
  const [editRequiresApproval, setEditRequiresApproval] = useState(reward.approvalKeyRequired);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const isAdmin = currentUser?.role === "admin";
  const canAfford = currentUser && currentUser.points >= reward.pointCost;
  
  const handleRedeemReward = async () => {
    if (reward.approvalKeyRequired) {
      toast.info("This reward requires admin approval. Please ask an admin to approve your redemption.");
      return;
    }
    
    try {
      setRedeeming(true);
      const pointsBefore = currentUser?.points || 0;
      await redeemReward(reward.id);
      
      // Show success dialog
      setRedemptionInfo({
        pointsSpent: reward.pointCost,
        remainingPoints: pointsBefore - reward.pointCost
      });
      setShowSuccess(true);
    } finally {
      setRedeeming(false);
    }
  };
  
  const handleEdit = async () => {
    try {
      await updateReward(reward.id, {
        title: editTitle,
        description: editDescription,
        pointCost: editPointCost,
        category: editCategory,
        approvalKeyRequired: editRequiresApproval
      });
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update reward");
    }
  };
  
  const handleDelete = async () => {
    try {
      await deleteReward(reward.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error("Failed to delete reward");
    }
  };
  
  const openEditDialog = () => {
    setEditTitle(reward.title);
    setEditDescription(reward.description);
    setEditPointCost(reward.pointCost);
    setEditCategory(reward.category || "general");
    setEditRequiresApproval(reward.approvalKeyRequired);
    setIsEditing(true);
  };
  
  return (
    <>
      <Card className="reward-card">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{reward.title}</CardTitle>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={openEditDialog}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="points-badge bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm font-semibold">
                {reward.pointCost}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 pb-2">
          <p className="text-sm text-muted-foreground">{reward.description}</p>
          {reward.approvalKeyRequired && (
            <div className="flex items-center gap-1 mt-2">
              <ShieldCheck size={12} className="text-amber-500" />
              <span className="text-xs text-amber-600 dark:text-amber-400">Requires admin approval</span>
            </div>
          )}
          {reward.category && (
            <Badge variant="outline" className="mt-2 text-xs">
              {reward.category}
            </Badge>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-2">
          <Button 
            onClick={handleRedeemReward} 
            disabled={!canAfford || redeeming}
            variant={canAfford ? "default" : "outline"}
            className="w-full"
          >
            {!canAfford ? (
              <span className="flex items-center">
                <Lock className="h-3 w-3 mr-2" /> Not enough points
              </span>
            ) : redeeming ? (
              "Redeeming..."
            ) : reward.approvalKeyRequired ? (
              "Request Approval"
            ) : (
              "Redeem Reward"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Success Dialog */}
      <RedemptionSuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        rewardTitle={reward.title}
        pointsSpent={redemptionInfo.pointsSpent}
        remainingPoints={redemptionInfo.remainingPoints}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Reward</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-points">Point Cost</Label>
                <Input
                  id="edit-points"
                  type="number"
                  min={1}
                  value={editPointCost}
                  onChange={(e) => setEditPointCost(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="activities">Activities</SelectItem>
                    <SelectItem value="toys">Toys</SelectItem>
                    <SelectItem value="privileges">Privileges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-approval">Requires Approval</Label>
              <Switch
                id="edit-approval"
                checked={editRequiresApproval}
                onCheckedChange={setEditRequiresApproval}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reward</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{reward.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
