
import { useState } from "react";
import { Reward } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Gift } from "lucide-react";

interface RewardCardProps {
  reward: Reward;
}

export function RewardCard({ reward }: RewardCardProps) {
  const { redeemReward } = useData();
  const { currentUser } = useAuth();
  const [redeeming, setRedeeming] = useState(false);
  
  const canAfford = currentUser && currentUser.points >= reward.pointCost;
  
  const handleRedeemReward = async () => {
    try {
      setRedeeming(true);
      await redeemReward(reward.id);
    } finally {
      setRedeeming(false);
    }
  };
  
  return (
    <Card className="reward-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{reward.title}</CardTitle>
          <div className="points-badge bg-secondary text-secondary-foreground">
            {reward.pointCost}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2">
        <p className="text-sm text-muted-foreground">{reward.description}</p>
        {reward.approvalKeyRequired && (
          <div className="flex items-center gap-1 mt-2">
            <Gift size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Requires admin approval</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <Button 
          onClick={handleRedeemReward} 
          disabled={!canAfford || redeeming}
          variant={canAfford ? "secondary" : "outline"}
          className="w-full"
        >
          {!canAfford ? (
            "Not enough points"
          ) : redeeming ? (
            "Redeeming..."
          ) : (
            "Redeem Reward"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
