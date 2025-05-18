
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

  return {
    updateUserProfile
  };
}
