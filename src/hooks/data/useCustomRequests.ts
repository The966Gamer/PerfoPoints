
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CustomRequest } from "@/types";
import { toast } from "sonner";

export function useCustomRequests() {
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch custom requests
  const fetchCustomRequests = async () => {
    try {
      setLoading(true);
      
      // Get the custom requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("custom_requests")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (requestsError) throw requestsError;
      
      // Get all profiles in a separate query
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username");
        
      if (profilesError) throw profilesError;
      
      // Create a map of user IDs to usernames
      const usernameMap = new Map();
      profilesData.forEach((profile: any) => {
        usernameMap.set(profile.id, profile.username);
      });
      
      // Map database columns to frontend naming and attach usernames
      const mappedCustomRequests: CustomRequest[] = requestsData.map(req => ({
        id: req.id,
        userId: req.user_id,
        title: req.title,
        description: req.description,
        type: req.type as "task" | "reward" | "other",
        status: req.status as "pending" | "approved" | "rejected",
        createdAt: req.created_at,
        updatedAt: req.updated_at,
        reviewedBy: null,
        username: usernameMap.get(req.user_id) || "Unknown User"
      }));
      
      setCustomRequests(mappedCustomRequests);
    } catch (error: any) {
      console.error("Error fetching custom requests:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit a custom request
  const submitCustomRequest = async (request: Omit<CustomRequest, 'id' | 'createdAt' | 'updatedAt' | 'reviewedBy'>) => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) throw new Error("No user logged in");
      
      const { error } = await supabase
        .from("custom_requests")
        .insert([{ 
          user_id: userId,
          title: request.title,
          description: request.description,
          type: request.type,
          status: 'pending'
        }]);
      
      if (error) throw error;
      
      toast.success("Custom request submitted successfully!");
      fetchCustomRequests();
      
      // Simplified notification
      toast.info("Your request has been submitted to administrators!");
    } catch (error: any) {
      console.error("Error submitting custom request:", error);
      toast.error(error.message);
    }
  };

  // Function to approve or reject a custom request
  const reviewCustomRequest = async (requestId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("custom_requests")
        .update({ status })
        .eq("id", requestId);
      
      if (error) throw error;
      
      toast.success(`Custom request ${status} successfully!`);
      fetchCustomRequests();
    } catch (error: any) {
      console.error("Error reviewing custom request:", error);
      toast.error(error.message);
    }
  };

  return {
    customRequests,
    loading,
    fetchCustomRequests,
    submitCustomRequest,
    reviewCustomRequest
  };
}
