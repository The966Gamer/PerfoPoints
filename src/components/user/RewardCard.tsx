
import { useState } from "react";
import { Reward } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Award, Key, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface RewardCardProps {
  reward: Reward;
  isPremium?: boolean;
}

export function RewardCard({ reward, isPremium }: RewardCardProps) {
  const { redeemReward } = useData();
  const { currentUser } = useAuth();
  const [redeeming, setRedeeming] = useState(false);
  const [isApprovalKeyOpen, setIsApprovalKeyOpen] = useState(false);
  const [approvalKey, setApprovalKey] = useState("");
  
  const canAfford = currentUser && currentUser.points >= reward.pointCost;
  
  const handleRedeemReward = async () => {
    try {
      if (reward.approvalKeyRequired) {
        setIsApprovalKeyOpen(true);
        return;
      }
      
      setRedeeming(true);
      await redeemReward(reward.id);
    } finally {
      setRedeeming(false);
    }
  };
  
  const handleApprovalKeySubmit = async () => {
    try {
      setRedeeming(true);
      
      // In a real app, this would validate the key on the server
      if (approvalKey.trim().length < 3) {
        toast.error("Please enter a valid approval key");
        return;
      }
      
      await redeemReward(reward.id);
      setIsApprovalKeyOpen(false);
      setApprovalKey("");
    } finally {
      setRedeeming(false);
    }
  };
  
  return (
    <Card className={`reward-card ${isPremium ? 'bg-gradient-to-br from-yellow-500/30 to-white dark:from-yellow-500/20 dark:to-gray-800/60 border-yellow-500/30' : ''}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{reward.title}</CardTitle>
            {isPremium && (
              <Badge variant="outline" className="bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-300">
                <Sparkles className="h-3 w-3 mr-1" /> Premium
              </Badge>
            )}
          </div>
          <div className="points-badge bg-secondary text-secondary-foreground">
            {reward.pointCost}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2">
        <p className="text-sm text-muted-foreground">{reward.description}</p>
        {reward.approvalKeyRequired && (
          <div className="flex items-center gap-1 mt-2">
            <Key size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Requires approval key</span>
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
          variant={canAfford ? (isPremium ? "secondary" : "default") : "outline"}
          className="w-full"
        >
          {!canAfford ? (
            <span className="flex items-center">
              <Lock className="h-3 w-3 mr-2" /> Not enough points
            </span>
          ) : redeeming ? (
            "Redeeming..."
          ) : (
            <span className="flex items-center justify-center">
              {isPremium && <Sparkles className="h-4 w-4 mr-2" />}
              Redeem Reward
            </span>
          )}
        </Button>
        
        <Dialog open={isApprovalKeyOpen} onOpenChange={setIsApprovalKeyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Approval Key</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="approvalKey">
                  This reward requires an approval key from an admin
                </Label>
                <Input
                  id="approvalKey"
                  placeholder="Enter approval key"
                  value={approvalKey}
                  onChange={(e) => setApprovalKey(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApprovalKeyOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApprovalKeySubmit} disabled={redeeming}>
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
