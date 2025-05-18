
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Notification function for creating user notifications
export const createNotification = async (notification: { userId: string, message: string }) => {
  try {
    // Currently, we're just using a simplified approach with toast notifications
    // In a future implementation, this could store notifications in a dedicated table
    console.log("Creating notification:", notification);
    
    // For now, we just mark that the user has a notification
    const { error } = await supabase
      .from("profiles")
      .update({ notification_seen: false })
      .eq("id", notification.userId);
    
    if (error) {
      console.error("Error creating notification:", error);
      return;
    }
    
    console.log("Notification scheduled:", notification);
  } catch (error: any) {
    console.error("Error creating notification:", error);
  }
};

// Display a notification toast
export const showNotification = (message: string, type: "success" | "error" | "info" = "info") => {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "info":
    default:
      toast.info(message);
      break;
  }
};
