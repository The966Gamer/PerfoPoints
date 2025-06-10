
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserMeter, MeterHistory } from "@/types";
import { toast } from "sonner";

// Transform database meter to frontend format
const transformMeter = (dbMeter: any): UserMeter => ({
  id: dbMeter.id,
  userId: dbMeter.user_id,
  meterType: dbMeter.meter_type,
  currentPercentage: dbMeter.current_percentage,
  targetPercentage: dbMeter.target_percentage,
  isActive: dbMeter.is_active,
  createdBy: dbMeter.created_by,
  createdAt: dbMeter.created_at,
  completedAt: dbMeter.completed_at,
  prizeUnlocked: dbMeter.prize_unlocked,
  description: dbMeter.description,
  username: dbMeter.profiles?.username
});

// Hook to get all user meters (admin only)
export const useUserMeters = () => {
  return useQuery({
    queryKey: ["userMeters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_meters")
        .select(`
          *,
          profiles!user_meters_user_id_fkey (username)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(transformMeter);
    },
  });
};

// Hook to get meters for a specific user
export const useUserMetersByUserId = (userId: string) => {
  return useQuery({
    queryKey: ["userMeters", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_meters")
        .select(`
          *,
          profiles!user_meters_user_id_fkey (username)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(transformMeter);
    },
    enabled: !!userId,
  });
};

// Hook to get current active meter for a user
export const useActiveUserMeter = (userId: string) => {
  return useQuery({
    queryKey: ["activeUserMeter", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_meters")
        .select(`
          *,
          profiles!user_meters_user_id_fkey (username)
        `)
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data ? transformMeter(data) : null;
    },
    enabled: !!userId,
  });
};

// Hook to create a new meter
export const useCreateMeter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meterData: {
      userIds: string[];
      meterType?: string;
      targetPercentage?: number;
      description?: string;
    }) => {
      const { userIds, meterType = "standard", targetPercentage = 100, description } = meterData;
      
      // Deactivate existing meters for these users first
      const { error: deactivateError } = await supabase
        .from("user_meters")
        .update({ is_active: false })
        .in("user_id", userIds)
        .eq("is_active", true);

      if (deactivateError) throw deactivateError;

      // Create new meters
      const metersToCreate = userIds.map(userId => ({
        user_id: userId,
        meter_type: meterType,
        target_percentage: targetPercentage,
        description,
        current_percentage: 0,
        is_active: true
      }));

      const { data, error } = await supabase
        .from("user_meters")
        .insert(metersToCreate)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userMeters"] });
      queryClient.invalidateQueries({ queryKey: ["activeUserMeter"] });
      toast.success("Percentage meters created successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to create meters: ${error.message}`);
    },
  });
};

// Hook to update meter percentage
export const useUpdateMeterPercentage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: {
      userId: string;
      percentageChange: number;
      reason?: string;
    }) => {
      const { userId, percentageChange, reason } = updateData;

      const { data, error } = await supabase.rpc("update_meter_percentage", {
        p_user_id: userId,
        p_percentage_change: percentageChange,
        p_reason: reason
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userMeters"] });
      queryClient.invalidateQueries({ queryKey: ["activeUserMeter"] });
      toast.success("Meter percentage updated successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to update meter: ${error.message}`);
    },
  });
};

// Hook to deactivate a meter
export const useDeactivateMeter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meterId: string) => {
      const { error } = await supabase
        .from("user_meters")
        .update({ is_active: false })
        .eq("id", meterId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userMeters"] });
      queryClient.invalidateQueries({ queryKey: ["activeUserMeter"] });
      toast.success("Meter deactivated successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to deactivate meter: ${error.message}`);
    },
  });
};

// Hook to get meter history
export const useMeterHistory = (meterId: string) => {
  return useQuery({
    queryKey: ["meterHistory", meterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meter_history")
        .select("*")
        .eq("meter_id", meterId)
        .order("changed_at", { ascending: false });

      if (error) throw error;
      
      return data.map((history): MeterHistory => ({
        id: history.id,
        meterId: history.meter_id,
        userId: history.user_id,
        oldPercentage: history.old_percentage,
        newPercentage: history.new_percentage,
        changeAmount: history.change_amount,
        changeReason: history.change_reason,
        changedBy: history.changed_by,
        changedAt: history.changed_at
      }));
    },
    enabled: !!meterId,
  });
};
