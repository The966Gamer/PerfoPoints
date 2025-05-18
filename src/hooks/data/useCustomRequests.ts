
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
      
      const { data, error } = await supabase
        .from("custom_requests")
        .select(`*, profiles:user_id(username)`)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Map database columns to frontend naming
      const mappedCustomRequests: CustomRequest[] = data.map(req => ({
        id: req.id,
        userId: req.user_id,
        title: req.title,
        description: req.description,
        type: req.type as "task" | "reward" | "other",
        status: req.status as "pending" | "approved" | "rejected",
        createdAt: req.created_at,
        updatedAt: req.updated_at,
        // Fix: Use null for reviewedBy which might not exist
        reviewedBy: null,
        username: (req.profiles as any)?.username
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
        .insert([{ ...request, user_id: userId }]);
      
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
      
      // Simplified notification
      toast.success(`Custom request ${status === "approved" ? "approved" : "rejected"} successfully!`);
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
