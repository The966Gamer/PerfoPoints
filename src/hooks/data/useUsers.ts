
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";

export function useUsers() {
  // Update user profile function
  const updateUserProfile = async (
    userId: string,
    data: Partial<User>
  ): Promise<boolean> => {
    try {
      // Map User type to profiles table columns
      const profileData: any = {};
      
      if (data.username) profileData.username = data.username;
      if (data.fullName) profileData.full_name = data.fullName;
      if (data.avatarUrl) profileData.avatar_url = data.avatarUrl;
      if (data.email) profileData.email = data.email;
      if (data.points !== undefined) profileData.points = data.points;
      if (data.role) profileData.role = data.role;
      if (data.isBlocked !== undefined) profileData.is_blocked = data.isBlocked;
      
      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", userId);
      
      if (error) throw error;
      
      toast.success("User profile updated successfully!");
      return true;
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      toast.error(error.message);
      return false;
    }
  };

  // Function to grant points to a user (admin only)
  const grantPoints = async (
    userId: string, 
    points: number, 
    reason: string
  ): Promise<boolean> => {
    try {
      // First, get current points
      const { data: userData, error: fetchError } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentPoints = userData.points || 0;
      const newTotal = currentPoints + points;
      
      // Update points
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ points: newTotal })
        .eq("id", userId);
      
      if (updateError) throw updateError;
      
      // Record points history
      await supabase.from("points_history").insert({
        user_id: userId,
        points,
        new_total: newTotal,
        type: "admin_grant",
        reason
      });
      
      toast.success(`Granted ${points} points to user successfully!`);
      return true;
    } catch (error: any) {
      console.error("Error granting points:", error);
      toast.error(error.message);
      return false;
    }
  };

  // Function to grant keys to a user (admin only)
  const grantKeys = async (
    userId: string, 
    keyType: string,
    quantity: number, 
    reason: string
  ): Promise<boolean> => {
    try {
      // Check if user has keys of this type
      const { data: keyData, error: fetchError } = await supabase
        .from("user_keys")
        .select("quantity")
        .eq("user_id", userId)
        .eq("key_type", keyType)
        .maybeSingle();
      
      let currentQuantity = 0;
      let newTotal = quantity;
      
      if (fetchError) throw fetchError;
      
      if (keyData) {
        // User has keys, update quantity
        currentQuantity = keyData.quantity;
        newTotal = currentQuantity + quantity;
        
        const { error: updateError } = await supabase
          .from("user_keys")
          .update({ quantity: newTotal })
          .eq("user_id", userId)
          .eq("key_type", keyType);
          
        if (updateError) throw updateError;
      } else {
        // User does not have keys, insert new record
        const { error: insertError } = await supabase
          .from("user_keys")
          .insert({
            user_id: userId,
            key_type: keyType,
            quantity
          });
          
        if (insertError) throw insertError;
      }
      
      // Record keys history
      await supabase.from("keys_history").insert({
        user_id: userId,
        quantity,
        new_total: newTotal,
        type: "admin_grant",
        reason,
        key_type: keyType
      });
      
      toast.success(`Granted ${quantity} ${keyType} keys to user successfully!`);
      return true;
    } catch (error: any) {
      console.error("Error granting keys:", error);
      toast.error(error.message);
      return false;
    }
  };

  return {
    updateUserProfile,
    grantPoints,
    grantKeys
  };
}
