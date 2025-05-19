
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Notification function for creating user notifications
export const createNotification = async (notification: { userId: string, message: string }) => {
  try {
    // Currently, we're just using a simplified approach with toast notifications
    // In a future implementation, this could store notifications in a dedicated table
    console.log("Creating notification:", notification);
    
    // For now, we just show the toast notification
    toast.info(notification.message);
    
    console.log("Notification shown:", notification);
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

// Send email notification (using Supabase Edge Function)
export const sendEmailNotification = async (email: string, subject: string, message: string): Promise<boolean> => {
  try {
    // Call the send-email edge function
    const { data: { session } } = await supabase.auth.getSession();
    
    // Get the function URL with string concatenation instead of using the protected url property
    const functionEndpoint = "send-notification-email";
    const supabaseProjectRef = "qvfkazkgugonkrktiurw";
    const functionUrl = `https://${supabaseProjectRef}.functions.supabase.co/${functionEndpoint}`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`
      },
      body: JSON.stringify({
        email,
        subject,
        message
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    return true;
  } catch (error: any) {
    console.error("Error sending email notification:", error);
    return false;
  }
};
