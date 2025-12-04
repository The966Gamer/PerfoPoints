
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type KeyType = 'copper' | 'silver' | 'golden' | 'diamond' | 'ruby';

export interface UserKey {
  id: string;
  userId: string;
  keyType: KeyType;
  quantity: number;
}

export interface TaskKeyReward {
  id: string;
  taskId: string;
  keyType: KeyType;
  quantity: number;
}

export interface RewardKeyRequirement {
  id: string;
  rewardId: string;
  keyType: KeyType;
  quantity: number;
}

export const KEY_TYPES: KeyType[] = ['copper', 'silver', 'golden', 'diamond', 'ruby'];

export const KEY_DISPLAY: Record<KeyType, { name: string; color: string; emoji: string }> = {
  copper: { name: 'Copper', color: 'text-orange-600', emoji: '🔑' },
  silver: { name: 'Silver', color: 'text-gray-400', emoji: '🗝️' },
  golden: { name: 'Golden', color: 'text-yellow-500', emoji: '🔐' },
  diamond: { name: 'Diamond', color: 'text-cyan-400', emoji: '💎' },
  ruby: { name: 'Ruby', color: 'text-red-500', emoji: '❤️' },
};

export function useKeys() {
  const [userKeys, setUserKeys] = useState<UserKey[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch current user's keys
  const fetchUserKeys = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data, error } = await supabase
        .from("user_keys")
        .select("*")
        .eq("user_id", userData.user.id);

      if (error) throw error;

      const mapped: UserKey[] = (data || []).map(k => ({
        id: k.id,
        userId: k.user_id,
        keyType: k.key_type as KeyType,
        quantity: k.quantity
      }));

      setUserKeys(mapped);
    } catch (error: any) {
      console.error("Error fetching user keys:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch key rewards for a specific task
  const fetchTaskKeyRewards = async (taskId: string): Promise<TaskKeyReward[]> => {
    try {
      const { data, error } = await supabase
        .from("task_key_rewards")
        .select("*")
        .eq("task_id", taskId);

      if (error) throw error;

      return (data || []).map(k => ({
        id: k.id,
        taskId: k.task_id,
        keyType: k.key_type as KeyType,
        quantity: k.quantity
      }));
    } catch (error: any) {
      console.error("Error fetching task key rewards:", error);
      return [];
    }
  };

  // Fetch all task key rewards
  const fetchAllTaskKeyRewards = async (): Promise<TaskKeyReward[]> => {
    try {
      const { data, error } = await supabase
        .from("task_key_rewards")
        .select("*");

      if (error) throw error;

      return (data || []).map(k => ({
        id: k.id,
        taskId: k.task_id,
        keyType: k.key_type as KeyType,
        quantity: k.quantity
      }));
    } catch (error: any) {
      console.error("Error fetching all task key rewards:", error);
      return [];
    }
  };

  // Fetch key requirements for a specific reward
  const fetchRewardKeyRequirements = async (rewardId: string): Promise<RewardKeyRequirement[]> => {
    try {
      const { data, error } = await supabase
        .from("reward_key_requirements")
        .select("*")
        .eq("reward_id", rewardId);

      if (error) throw error;

      return (data || []).map(k => ({
        id: k.id,
        rewardId: k.reward_id,
        keyType: k.key_type as KeyType,
        quantity: k.quantity
      }));
    } catch (error: any) {
      console.error("Error fetching reward key requirements:", error);
      return [];
    }
  };

  // Fetch all reward key requirements
  const fetchAllRewardKeyRequirements = async (): Promise<RewardKeyRequirement[]> => {
    try {
      const { data, error } = await supabase
        .from("reward_key_requirements")
        .select("*");

      if (error) throw error;

      return (data || []).map(k => ({
        id: k.id,
        rewardId: k.reward_id,
        keyType: k.key_type as KeyType,
        quantity: k.quantity
      }));
    } catch (error: any) {
      console.error("Error fetching all reward key requirements:", error);
      return [];
    }
  };

  // Add key rewards to a task
  const addTaskKeyRewards = async (taskId: string, keyRewards: { keyType: KeyType; quantity: number }[]) => {
    try {
      // First delete existing rewards for this task
      await supabase.from("task_key_rewards").delete().eq("task_id", taskId);

      // Insert new rewards
      if (keyRewards.length > 0) {
        const { error } = await supabase.from("task_key_rewards").insert(
          keyRewards.map(kr => ({
            task_id: taskId,
            key_type: kr.keyType,
            quantity: kr.quantity
          }))
        );
        if (error) throw error;
      }

      return true;
    } catch (error: any) {
      console.error("Error adding task key rewards:", error);
      toast.error("Failed to add key rewards to task");
      return false;
    }
  };

  // Add key requirements to a reward
  const addRewardKeyRequirements = async (rewardId: string, keyRequirements: { keyType: KeyType; quantity: number }[]) => {
    try {
      // First delete existing requirements for this reward
      await supabase.from("reward_key_requirements").delete().eq("reward_id", rewardId);

      // Insert new requirements
      if (keyRequirements.length > 0) {
        const { error } = await supabase.from("reward_key_requirements").insert(
          keyRequirements.map(kr => ({
            reward_id: rewardId,
            key_type: kr.keyType,
            quantity: kr.quantity
          }))
        );
        if (error) throw error;
      }

      return true;
    } catch (error: any) {
      console.error("Error adding reward key requirements:", error);
      toast.error("Failed to add key requirements to reward");
      return false;
    }
  };

  // Check if user has required keys
  const hasRequiredKeys = (requirements: RewardKeyRequirement[]): boolean => {
    for (const req of requirements) {
      const userKey = userKeys.find(k => k.keyType === req.keyType);
      if (!userKey || userKey.quantity < req.quantity) {
        return false;
      }
    }
    return true;
  };

  // Get user's key quantity for a specific type
  const getKeyQuantity = (keyType: KeyType): number => {
    const key = userKeys.find(k => k.keyType === keyType);
    return key?.quantity || 0;
  };

  // Deduct keys from user
  const deductKeys = async (keysToDeduct: { keyType: KeyType; quantity: number }[]): Promise<boolean> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Not logged in");

      for (const { keyType, quantity } of keysToDeduct) {
        const { data: keyData, error: fetchError } = await supabase
          .from("user_keys")
          .select("quantity")
          .eq("user_id", userData.user.id)
          .eq("key_type", keyType)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (!keyData || keyData.quantity < quantity) {
          throw new Error(`Not enough ${keyType} keys`);
        }

        const newQuantity = keyData.quantity - quantity;

        const { error: updateError } = await supabase
          .from("user_keys")
          .update({ quantity: newQuantity })
          .eq("user_id", userData.user.id)
          .eq("key_type", keyType);

        if (updateError) throw updateError;
      }

      await fetchUserKeys();
      return true;
    } catch (error: any) {
      console.error("Error deducting keys:", error);
      toast.error(error.message || "Failed to deduct keys");
      return false;
    }
  };

  useEffect(() => {
    fetchUserKeys();
  }, []);

  return {
    userKeys,
    loading,
    fetchUserKeys,
    fetchTaskKeyRewards,
    fetchAllTaskKeyRewards,
    fetchRewardKeyRequirements,
    fetchAllRewardKeyRequirements,
    addTaskKeyRewards,
    addRewardKeyRequirements,
    hasRequiredKeys,
    getKeyQuantity,
    deductKeys,
    KEY_TYPES,
    KEY_DISPLAY
  };
}
