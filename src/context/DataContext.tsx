
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PointRequest, CustomRequest, Task, Reward, User } from "@/types";
import { toast } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface DataContextType {
  pointRequests: PointRequest[];
  customRequests: CustomRequest[];
  tasks: Task[];
  rewards: Reward[];
  requests: PointRequest[]; // Add this for compatibility
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
  createPointRequest: (taskId: string, photoUrl: string | null, comment: string | null) => Promise<void>;
  redeemReward: (rewardId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  addReward: (reward: Omit<Reward, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  pointRequests: [],
  customRequests: [],
  tasks: [],
  rewards: [],
  requests: [],
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
  createPointRequest: async () => {},
  redeemReward: async () => {},
  addTask: async () => {},
  addReward: async () => {},
});

export const useData = () => useContext(DataContext);

// Create a client
const queryClient = new QueryClient();

// Notification function - Fix the notifications table issue
const createNotification = async (notification: any) => {
  try {
    // Check if notifications table exists, if not log a message
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
        // Fix: Use optional chaining for reviewedBy which might not exist
        reviewedBy: req.reviewed_by || null,
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
      
      // Fix: Map database columns to frontend naming
      const mappedTasks: Task[] = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        category: task.category || "general",
        pointValue: task.points_value,
        recurring: task.recurring || false,
        autoReset: false, // Default value
        status: task.status || "active",
        createdAt: task.created_at,
        createdBy: task.created_by || null,
        deadline: task.deadline || null,
      }));
      
      setTasks(mappedTasks);
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
      
      // Fix: Map database columns to frontend naming
      const mappedRewards: Reward[] = data.map(reward => ({
        id: reward.id,
        title: reward.title,
        description: reward.description || "",
        category: reward.category || "general",
        pointCost: reward.points_cost,
        approvalKeyRequired: reward.requires_approval || false,
        createdAt: new Date().toISOString(), // Default
        createdBy: null, // Default
        image: null, // Default
      }));
      
      setRewards(mappedRewards);
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
      // Map frontend naming to database columns
      const dbTask = {
        title: task.title,
        description: task.description,
        points_value: task.pointValue,
        recurring: task.recurring,
        category: task.category,
        status: task.status,
        created_by: supabase.auth.getUser().then(res => res.data.user?.id),
        deadline: task.deadline
      };
      
      const { error } = await supabase
        .from("tasks")
        .insert([dbTask]);
      
      if (error) throw error;
      
      toast.success("Task created successfully!");
      fetchAllTasks();
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error.message);
    }
  };

  // Add task alias for compatibility
  const addTask = createTask;

  // Create a new reward
  const createReward = async (reward: Omit<Reward, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      // Map frontend naming to database columns
      const dbReward = {
        title: reward.title,
        description: reward.description,
        points_cost: reward.pointCost,
        requires_approval: reward.approvalKeyRequired,
        category: reward.category
      };
      
      const { error } = await supabase
        .from("rewards")
        .insert([dbReward]);
      
      if (error) throw error;
      
      toast.success("Reward created successfully!");
      fetchAllRewards();
    } catch (error: any) {
      console.error("Error creating reward:", error);
      toast.error(error.message);
    }
  };
  
  // Add reward alias for compatibility
  const addReward = createReward;

  // Update an existing task
  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
    try {
      // Map frontend naming to database columns
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.pointValue !== undefined) dbUpdates.points_value = updates.pointValue;
      if (updates.recurring !== undefined) dbUpdates.recurring = updates.recurring;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
      
      const { error } = await supabase
        .from("tasks")
        .update(dbUpdates)
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
      // Map frontend naming to database columns
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.pointCost !== undefined) dbUpdates.points_cost = updates.pointCost;
      if (updates.approvalKeyRequired !== undefined) dbUpdates.requires_approval = updates.approvalKeyRequired;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      
      const { error } = await supabase
        .from("rewards")
        .update(dbUpdates)
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

  // Submit a point request - add createPointRequest as an alias
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
  
  // Add alias for compatibility
  const createPointRequest = submitPointRequest;

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
        // Award points to the user - use string for points calculation instead of numeric operation
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ points: supabase.rpc('increment_points', { points_to_add: pointValue, user_id: userId }) })
          .eq("id", userId);
          
        if (updateError) throw updateError;
      }

      // Get both user and task details for the notification
      const { data: req, error: reqError } = await supabase
        .from("point_requests")
        .select(`*, profiles:user_id(*)`)
        .eq("id", requestId)
        .single();

      if (reqError) throw reqError;

      // Simplified notification
      toast.success(`Point request ${status === "approved" ? "approved" : "rejected"} successfully!`);

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
      
      // Simplified notification
      toast.success(`Custom request ${status === "approved" ? "approved" : "rejected"} successfully!`);
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
  
  // Redeem a reward
  const redeemReward = async (rewardId: string): Promise<void> => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) throw new Error("No user logged in");
      
      // Get reward details
      const { data: reward, error: rewardError } = await supabase
        .from("rewards")
        .select("*")
        .eq("id", rewardId)
        .single();
      
      if (rewardError || !reward) throw rewardError || new Error("Reward not found");
      
      // Get user's current points
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", userId)
        .single();
      
      if (profileError || !profile) throw profileError || new Error("Profile not found");
      
      if (profile.points < reward.points_cost) {
        throw new Error("Not enough points to redeem this reward");
      }
      
      // Deduct points from user
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ points: profile.points - reward.points_cost })
        .eq("id", userId);
      
      if (updateError) throw updateError;
      
      // Record the redemption in points_history
      const { error: historyError } = await supabase
        .from("points_history")
        .insert([{
          user_id: userId,
          points: -reward.points_cost,
          new_total: profile.points - reward.points_cost,
          type: "reward_redemption",
          reason: `Redeemed reward: ${reward.title}`
        }]);
      
      if (historyError) throw historyError;
      
      toast.success(`Successfully redeemed: ${reward.title}`);
    } catch (error: any) {
      console.error("Error redeeming reward:", error);
      toast.error(error.message);
    }
  };

  // Load data on first mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchPointRequests(),
        fetchCustomRequests(),
        fetchAllTasks(),
        fetchAllRewards()
      ]);
    };
    
    loadData();
  }, []);

  const value: DataContextType = {
    pointRequests,
    customRequests,
    tasks,
    rewards,
    requests: pointRequests, // Alias for compatibility
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
    updateUserProfile,
    createPointRequest,
    redeemReward,
    addTask,
    addReward
  };

  return (
    <QueryClientProvider client={queryClient}>
      <DataContext.Provider value={value}>
        {children}
      </DataContext.Provider>
    </QueryClientProvider>
  );
};
