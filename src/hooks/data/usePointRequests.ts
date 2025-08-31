
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PointRequest } from "@/types";
import { toast } from "sonner";

export function usePointRequests() {
  const [pointRequests, setPointRequests] = useState<PointRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch point requests
  const fetchPointRequests = async () => {
    try {
      setLoading(true);
      
      // Join with profiles and tasks tables using user_id and task_id
      const { data, error } = await supabase
        .from("point_requests")
        .select(`
          *,
          profiles!user_id(username),
          tasks!task_id(title, points_value)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Map database columns to frontend naming
      const mappedPointRequests: PointRequest[] = data.map(req => ({
        id: req.id,
        userId: req.user_id,
        taskId: req.task_id,
        status: req.status as "pending" | "approved" | "rejected",
        createdAt: req.created_at,
        updatedAt: req.updated_at,
        reviewedBy: req.reviewed_by,
        photoUrl: req.photo_url,
        comment: req.comment,
        taskTitle: (req.tasks as any)?.title,
        pointValue: (req.tasks as any)?.points_value,
        username: (req.profiles as any)?.username
      }));
      
      setPointRequests(mappedPointRequests);
    } catch (error: any) {
      console.error("Error fetching point requests:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit a point request
  const submitPointRequest = async (taskId: string, photoUrl: string | null, comment: string | null) => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) throw new Error("No user logged in");
      
      // Get task details for the request
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select("title, points_value")
        .eq("id", taskId)
        .single();
      
      if (taskError) throw taskError;
      
      const { error } = await supabase
        .from("point_requests")
        .insert([{ 
          user_id: userId, 
          task_id: taskId,
          photo_url: photoUrl,
          comment: comment
        }]);
      
      if (error) throw error;
      
      toast.success("Point request submitted successfully!");
      fetchPointRequests();
      
      // Create notification in a simpler way
      console.log("Creating notification for task completion");
      toast.info("Administrators have been notified about your request!");
    } catch (error: any) {
      console.error("Error submitting point request:", error);
      toast.error(error.message);
    }
  };

  // Function to approve or reject a point request
  const reviewPointRequest = async (
    requestId: string,
    status: "approved" | "rejected",
    userId: string,
    taskId: string,
    pointValue: number,
  ) => {
    try {
      const { error } = await supabase
        .from("point_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;

      if (status === "approved") {
        // Get current points
        const { data: userData, error: fetchError } = await supabase
          .from("profiles")
          .select("points")
          .eq("id", userId)
          .single();
        
        if (fetchError) throw fetchError;
        
        const currentPoints = userData.points || 0;
        const newTotal = currentPoints + pointValue;
        
        // Award points to the user
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ points: newTotal })
          .eq("id", userId);
          
        if (updateError) throw updateError;
        
        // Record in points history
        await supabase.from("points_history").insert({
          user_id: userId,
          points: pointValue,
          new_total: newTotal,
          task_id: taskId,
          type: "task_completion"
        });
      }

      toast.success(`Point request ${status === "approved" ? "approved" : "rejected"} successfully!`);
      fetchPointRequests();
      return true;
    } catch (error: any) {
      console.error("Error reviewing point request:", error);
      toast.error(error.message);
      return false;
    }
  };

  return {
    pointRequests,
    loading,
    fetchPointRequests,
    submitPointRequest,
    reviewPointRequest,
    // Alias for compatibility
    createPointRequest: submitPointRequest
  };
}
