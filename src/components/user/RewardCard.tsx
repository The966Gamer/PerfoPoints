
import { useState, useEffect } from "react";
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
import { Lock, ShieldCheck, Edit, Trash2, KeyRound, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { RedemptionSuccessDialog } from "@/components/ui/RedemptionSuccessDialog";
import { useKeys, KEY_TYPES, KEY_DISPLAY, KeyType, RewardKeyRequirement } from "@/hooks/data/useKeys";

interface RewardCardProps {
  reward: Reward;
}

export function RewardCard({ reward }: RewardCardProps) {
  const { redeemReward, updateReward, deleteReward } = useData();
  const { currentUser } = useAuth();
  const { userKeys, fetchRewardKeyRequirements, addRewardKeyRequirements, hasRequiredKeys, deductKeys } = useKeys();
  const [redeeming, setRedeeming] = useState(false);
  const [keyRequirements, setKeyRequirements] = useState<RewardKeyRequirement[]>([]);
  
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
  const [editKeyRequirements, setEditKeyRequirements] = useState<{ keyType: KeyType; quantity: number }[]>([]);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const isAdmin = currentUser?.role === "admin";
  const canAfford = currentUser && currentUser.points >= reward.pointCost;
  const hasKeys = hasRequiredKeys(keyRequirements);
  const canRedeem = canAfford && hasKeys;

  useEffect(() => {
    const loadKeyRequirements = async () => {
      const reqs = await fetchRewardKeyRequirements(reward.id);
      setKeyRequirements(reqs);
    };
    loadKeyRequirements();
  }, [reward.id]);
  
  const handleRedeemReward = async () => {
    if (reward.approvalKeyRequired) {
      toast.info("This reward requires admin approval. Please ask an admin to approve your redemption.");
      return;
    }
    
    if (!hasKeys) {
      toast.error("You don't have the required keys for this reward.");
      return;
    }
    
    try {
      setRedeeming(true);
      const pointsBefore = currentUser?.points || 0;
      
      // Deduct keys first if required
      if (keyRequirements.length > 0) {
        const keysDeducted = await deductKeys(keyRequirements.map(kr => ({ keyType: kr.keyType, quantity: kr.quantity })));
        if (!keysDeducted) {
          setRedeeming(false);
          return;
        }
      }
      
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
      
      // Update key requirements
      await addRewardKeyRequirements(reward.id, editKeyRequirements);
      
      setIsEditing(false);
      
      // Refresh key requirements
      const reqs = await fetchRewardKeyRequirements(reward.id);
      setKeyRequirements(reqs);
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
  
  const openEditDialog = async () => {
    setEditTitle(reward.title);
    setEditDescription(reward.description);
    setEditPointCost(reward.pointCost);
    setEditCategory(reward.category || "general");
    setEditRequiresApproval(reward.approvalKeyRequired);
    
    // Load existing key requirements
    const reqs = await fetchRewardKeyRequirements(reward.id);
    setEditKeyRequirements(reqs.map(r => ({ keyType: r.keyType, quantity: r.quantity })));
    
    setIsEditing(true);
  };

  const addKeyRequirement = () => {
    setEditKeyRequirements([...editKeyRequirements, { keyType: 'copper', quantity: 1 }]);
  };

  const removeKeyRequirement = (index: number) => {
    setEditKeyRequirements(editKeyRequirements.filter((_, i) => i !== index));
  };

  const updateKeyRequirement = (index: number, field: 'keyType' | 'quantity', value: any) => {
    const updated = [...editKeyRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setEditKeyRequirements(updated);
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
          
          {/* Key Requirements Display */}
          {keyRequirements.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {keyRequirements.map((kr, i) => {
                const keyInfo = KEY_DISPLAY[kr.keyType];
                const userHas = userKeys.find(k => k.keyType === kr.keyType)?.quantity || 0;
                const hasEnough = userHas >= kr.quantity;
                return (
                  <Badge 
                    key={i} 
                    variant={hasEnough ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {keyInfo.emoji} {kr.quantity}x {keyInfo.name}
                  </Badge>
                );
              })}
            </div>
          )}
          
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
            disabled={!canRedeem || redeeming}
            variant={canRedeem ? "default" : "outline"}
            className="w-full"
          >
            {!canAfford ? (
              <span className="flex items-center">
                <Lock className="h-3 w-3 mr-2" /> Not enough points
              </span>
            ) : !hasKeys ? (
              <span className="flex items-center">
                <KeyRound className="h-3 w-3 mr-2" /> Missing required keys
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
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
            
            {/* Key Requirements */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Required Keys</Label>
                <Button type="button" variant="outline" size="sm" onClick={addKeyRequirement}>
                  <Plus className="h-4 w-4 mr-1" /> Add Key
                </Button>
              </div>
              {editKeyRequirements.map((kr, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select 
                    value={kr.keyType} 
                    onValueChange={(v) => updateKeyRequirement(index, 'keyType', v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KEY_TYPES.map(kt => (
                        <SelectItem key={kt} value={kt}>
                          {KEY_DISPLAY[kt].emoji} {KEY_DISPLAY[kt].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    value={kr.quantity}
                    onChange={(e) => updateKeyRequirement(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeKeyRequirement(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
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
