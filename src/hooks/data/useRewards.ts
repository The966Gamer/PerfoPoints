
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reward } from "@/types";
import { toast } from "sonner";

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all rewards
  const fetchAllRewards = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .order("id", { ascending: false });
      
      if (error) throw error;
      
      // Map database columns to frontend naming
      const mappedRewards: Reward[] = data.map(reward => ({
        id: reward.id,
        title: reward.title,
        description: reward.description || "",
        category: reward.category || "general",
        pointCost: reward.points_cost,
        approvalKeyRequired: reward.requires_approval || false,
        createdAt: new Date().toISOString(), // Default since rewards table doesn't have this field
        createdBy: null, // Default
        image: null, // Default
      }));
      
      setRewards(mappedRewards);
    } catch (error: any) {
      console.error("Error fetching rewards:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new reward
  const createReward = async (reward: Omit<Reward, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      // Map frontend naming to database columns
      const dbReward = {
        title: reward.title,
        description: reward.description,
        points_cost: reward.pointCost,
        requires_approval: reward.approvalKeyRequired,
        category: reward.category
      };
      
      const { error } = await supabase
        .from("rewards")
        .insert([dbReward]);
      
      if (error) throw error;
      
      toast.success("Reward created successfully!");
      fetchAllRewards();
    } catch (error: any) {
      console.error("Error creating reward:", error);
      toast.error(error.message);
    }
  };

  // Update an existing reward
  const updateReward = async (rewardId: string, updates: Partial<Reward>): Promise<boolean> => {
    try {
      // Map frontend naming to database columns
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.pointCost !== undefined) dbUpdates.points_cost = updates.pointCost;
      if (updates.approvalKeyRequired !== undefined) dbUpdates.requires_approval = updates.approvalKeyRequired;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      
      const { error } = await supabase
        .from("rewards")
        .update(dbUpdates)
        .eq("id", rewardId);
      
      if (error) throw error;
      
      toast.success("Reward updated successfully!");
      fetchAllRewards();
      return true;
    } catch (error: any) {
      console.error("Error updating reward:", error);
      toast.error(error.message);
      return false;
    }
  };

  // Delete a reward
  const deleteReward = async (rewardId: string) => {
    try {
      const { error } = await supabase
        .from("rewards")
        .delete()
        .eq("id", rewardId);
      
      if (error) throw error;
      
      toast.success("Reward deleted successfully!");
      fetchAllRewards();
    } catch (error: any) {
      console.error("Error deleting reward:", error);
      toast.error(error.message);
    }
  };

  // Redeem a reward
  const redeemReward = async (rewardId: string): Promise<void> => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) throw new Error("No user logged in");
      
      // Get reward details
      const { data: reward, error: rewardError } = await supabase
        .from("rewards")
        .select("*")
        .eq("id", rewardId)
        .single();
      
      if (rewardError || !reward) throw rewardError || new Error("Reward not found");
      
      // Get user's current points
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", userId)
        .single();
      
      if (profileError || !profile) throw profileError || new Error("Profile not found");
      
      if (profile.points < reward.points_cost) {
        throw new Error("Not enough points to redeem this reward");
      }
      
      // Deduct points from user
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ points: profile.points - reward.points_cost })
        .eq("id", userId);
      
      if (updateError) throw updateError;
      
      // Record the redemption in points_history
      const { error: historyError } = await supabase
        .from("points_history")
        .insert([{
          user_id: userId,
          points: -reward.points_cost,
          new_total: profile.points - reward.points_cost,
          type: "reward_redemption",
          reason: `Redeemed reward: ${reward.title}`
        }]);
      
      if (historyError) throw historyError;
      
      toast.success(`Successfully redeemed: ${reward.title}`);
    } catch (error: any) {
      console.error("Error redeeming reward:", error);
      toast.error(error.message);
    }
  };

  return {
    rewards,
    loading,
    fetchAllRewards,
    createReward,
    updateReward,
    deleteReward,
    redeemReward,
    // Alias for compatibility
    addReward: createReward
  };
}
