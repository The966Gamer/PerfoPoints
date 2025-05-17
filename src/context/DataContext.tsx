import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PointRequest, CustomRequest, Task, Reward, User } from "@/types";
import { toast } from "sonner";

interface DataContextType {
  pointRequests: PointRequest[];
  customRequests: CustomRequest[];
  tasks: Task[];
  rewards: Reward[];
  loading: boolean;
  fetchPointRequests: () => Promise<void>;
  fetchCustomRequests: () => Promise<void>;
  fetchAllTasks: () => Promise<void>;
  fetchAllRewards: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  createReward: (reward: Omit<Reward, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  updateReward: (rewardId: string, updates: Partial<Reward>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<void>;
  deleteReward: (rewardId: string) => Promise<void>;
  submitPointRequest: (taskId: string, photoUrl: string | null, comment: string | null) => Promise<void>;
  submitCustomRequest: (request: Omit<CustomRequest, 'id' | 'createdAt' | 'updatedAt' | 'reviewedBy'>) => Promise<void>;
  reviewPointRequest: (requestId: string, status: "approved" | "rejected", userId: string, taskId: string, pointValue: number) => Promise<boolean>;
  reviewCustomRequest: (requestId: string, status: "approved" | "rejected") => Promise<void>;
  updateUserProfile: (userId: string, data: Partial<User>) => Promise<boolean>;
}

const DataContext = createContext<DataContextType>({
  pointRequests: [],
  customRequests: [],
  tasks: [],
  rewards: [],
  loading: true,
  fetchPointRequests: async () => {},
  fetchCustomRequests: async () => {},
  fetchAllTasks: async () => {},
  fetchAllRewards: async () => {},
  createTask: async () => {},
  createReward: async () => {},
  updateTask: async () => false,
  updateReward: async () => false,
  deleteTask: async () => {},
  deleteReward: async () => {},
  submitPointRequest: async () => {},
  submitCustomRequest: async () => {},
  reviewPointRequest: async () => false,
  reviewCustomRequest: async () => {},
  updateUserProfile: async () => false,
});

export const useData = () => useContext(DataContext);

// Notification function
const createNotification = async (notification: any) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .insert([notification]);
    
    if (error) throw error;
    
    console.log("Notification created:", notification);
  } catch (error: any) {
    console.error("Error creating notification:", error);
  }
};

// Context provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [pointRequests, setPointRequests] = useState<PointRequest[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch point requests
  const fetchPointRequests = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("point_requests")
        .select(`*, profiles:user_id(username), tasks:task_id(title, points_value)`)
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
        reviewedBy: req.reviewed_by,
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

  // Fetch all tasks
  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setTasks(data);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all rewards
  const fetchAllRewards = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setRewards(data);
    } catch (error: any) {
      console.error("Error fetching rewards:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .insert([{ ...task, created_by: supabase.auth.currentUser?.uid }]);
      
      if (error) throw error;
      
      toast.success("Task created successfully!");
      fetchAllTasks();
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error.message);
    }
  };

  // Create a new reward
  const createReward = async (reward: Omit<Reward, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      const { error } = await supabase
        .from("rewards")
        .insert([{ ...reward, created_by: supabase.auth.currentUser?.uid }]);
      
      if (error) throw error;
      
      toast.success("Reward created successfully!");
      fetchAllRewards();
    } catch (error: any) {
      console.error("Error creating reward:", error);
      toast.error(error.message);
    }
  };

  // Update an existing task
  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId);
      
      if (error) throw error;
      
      toast.success("Task updated successfully!");
      fetchAllTasks();
      return true;
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error(error.message);
      return false;
    }
  };

  // Update an existing reward
  const updateReward = async (rewardId: string, updates: Partial<Reward>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("rewards")
        .update(updates)
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

  // Delete a task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);
      
      if (error) throw error;
      
      toast.success("Task deleted successfully!");
      fetchAllTasks();
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast.error(error.message);
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

  // Submit a point request
  const submitPointRequest = async (taskId: string, photoUrl: string | null, comment: string | null) => {
    try {
      const userId = supabase.auth.currentUser?.uid;
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
      
      // Send a notification to admins about the new request
      await createNotification({
        title: "New Point Request",
        message: `A new point request has been submitted for task "${task?.title}"`,
        type: "info",
        userId: userId
      });
    } catch (error: any) {
      console.error("Error submitting point request:", error);
      toast.error(error.message);
    }
  };

  // Submit a custom request
  const submitCustomRequest = async (request: Omit<CustomRequest, 'id' | 'createdAt' | 'updatedAt' | 'reviewedBy'>) => {
    try {
      const userId = supabase.auth.currentUser?.uid;
      if (!userId) throw new Error("No user logged in");
      
      const { error } = await supabase
        .from("custom_requests")
        .insert([{ ...request, user_id: userId }]);
      
      if (error) throw error;
      
      toast.success("Custom request submitted successfully!");
      fetchCustomRequests();
      
      // Send a notification to admins about the new custom request
      await createNotification({
        title: "New Custom Request",
        message: `A new custom request of type "${request.type}" has been submitted`,
        type: "info",
        userId: userId
      });
    } catch (error: any) {
      console.error("Error submitting custom request:", error);
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
        // Award points to the user
        const { error: updateError } = await supabase.from("profiles").update({ points: () => `points + ${pointValue}` }).eq("id", userId);
        if (updateError) throw updateError;
      }

      // Get both user and task details for the notification
      const { data: req, error: reqError } = await supabase
        .from("point_requests")
        .select(`*, profiles:user_id(*)`)
        .eq("id", requestId)
        .single();

      if (reqError) throw reqError;

      if (status === "approved") {
        // Send a notification that points were awarded
        await createNotification({
          title: "Points Awarded",
          message: `You earned ${pointValue} points for completing: ${(req.profiles as any)?.username || 'a task'}`,
          type: "success",
          userId: userId
        });
      } else {
        // Send a notification that the request was rejected
        await createNotification({
          title: "Request Rejected",
          message: `Your point request for task "${(req.profiles as any)?.username || 'Unknown'}" was rejected`,
          type: "error",
          userId: userId
        });
      }

      return true;
    } catch (error: any) {
      console.error("Error reviewing point request:", error);
      toast.error(error.message);
      return false;
    } finally {
      fetchPointRequests();
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
      
      // Send a notification to the user about the review
      const { data: request, error: requestError } = await supabase
        .from("custom_requests")
        .select(`*, profiles:user_id(username)`)
        .eq("id", requestId)
        .single();
      
      if (requestError) throw requestError;
      
      await createNotification({
        title: `Custom Request ${status}`,
        message: `Your custom request "${request?.title}" has been ${status}`,
        type: status === "approved" ? "success" : "error",
        userId: request?.user_id
      });
    } catch (error: any) {
      console.error("Error reviewing custom request:", error);
      toast.error(error.message);
    }
  };

  // Update user profile function
  const updateUserProfile = async (
    userId: string,
    data: Partial<User>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", userId);
      
      if (error) throw error;
      
      toast.success("User profile updated successfully!");

      const { data: req, error: reqError } = await supabase
        .from("profiles")
        .select(`*`)
        .eq("id", userId)
        .single();

      if (reqError) throw reqError;

      // Create notification for profile update
      await createNotification({
        title: "Profile Updated",
        message: `Your profile has been updated successfully, ${req?.username || 'User'}!`,
        type: "info",
        userId: userId
      });

      return true;
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      toast.error(error.message);
      return false;
    }
  };

  const value: DataContextType = {
    pointRequests,
    customRequests,
    tasks,
    rewards,
    loading,
    fetchPointRequests,
    fetchCustomRequests,
    fetchAllTasks,
    fetchAllRewards,
    createTask,
    createReward,
    updateTask,
    updateReward,
    deleteTask,
    deleteReward,
    submitPointRequest,
    submitCustomRequest,
    reviewPointRequest,
    reviewCustomRequest,
    updateUserProfile
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
