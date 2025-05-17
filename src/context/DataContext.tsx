
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { Task, Reward, PointRequest, CustomRequest, DbToFrontendMappings } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Context type definition
interface DataContextType {
  tasks: Task[];
  rewards: Reward[];
  requests: PointRequest[];
  customRequests: CustomRequest[];
  loading: boolean;
  createTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  createReward: (reward: Omit<Reward, "id" | "createdAt">) => Promise<void>;
  updateReward: (id: string, reward: Partial<Reward>) => Promise<void>;
  deleteReward: (id: string) => Promise<void>;
  redeemReward: (rewardId: string) => Promise<void>;
  createPointRequest: (taskId: string, photoUrl?: string | null, comment?: string | null) => Promise<void>;
  reviewPointRequest: (requestId: string, approved: boolean) => Promise<void>;
  createCustomRequest: (request: Omit<CustomRequest, "id" | "status" | "userId" | "createdAt" | "username">) => Promise<void>;
  reviewCustomRequest: (requestId: string, approved: boolean) => Promise<void>;
  // Aliases for common actions
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  addReward: (reward: Omit<Reward, "id" | "createdAt">) => Promise<void>;
}

// Create context
const DataContext = createContext<DataContextType>({
  tasks: [],
  rewards: [],
  requests: [],
  customRequests: [],
  loading: true,
  createTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  createReward: async () => {},
  updateReward: async () => {},
  deleteReward: async () => {},
  redeemReward: async () => {},
  createPointRequest: async () => {},
  reviewPointRequest: async () => {},
  createCustomRequest: async () => {},
  reviewCustomRequest: async () => {},
  addTask: async () => {},
  addReward: async () => {},
});

// Data Provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [requests, setRequests] = useState<PointRequest[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch data on initial load
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (tasksError) throw tasksError;
        
        // Map database fields to our Task type
        const mappedTasks: Task[] = (tasksData || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || "",
          pointValue: task.points_value,
          autoReset: task.recurring || false,
          createdAt: task.created_at,
          createdBy: task.created_by || "",
        }));
        
        setTasks(mappedTasks);
        
        // Fetch rewards
        const { data: rewardsData, error: rewardsError } = await supabase
          .from("rewards")
          .select("*")
          .order("points_cost", { ascending: true });
        
        if (rewardsError) throw rewardsError;
        
        // Map database fields to our Reward type
        const mappedRewards: Reward[] = (rewardsData || []).map(reward => ({
          id: reward.id,
          title: reward.title,
          description: reward.description || "",
          pointCost: reward.points_cost,
          approvalKeyRequired: reward.requires_approval,
          createdAt: new Date().toISOString(), // Since we don't have this field in the DB
          createdBy: currentUser?.id || "", 
        }));
        
        setRewards(mappedRewards);
        
        // Fetch point requests
        const { data: requestsData, error: requestsError } = await supabase
          .from("point_requests")
          .select(`
            *,
            tasks:task_id(title, points_value),
            profiles:user_id(username)
          `)
          .order("created_at", { ascending: false });
        
        if (requestsError) throw requestsError;
        
        // Safety check for profiles and casting
        const formattedRequests: PointRequest[] = requestsData?.map(req => {
          const username = req.profiles ? 
            (typeof req.profiles === 'object' && 'username' in req.profiles ? req.profiles.username : "Unknown User") :
            "Unknown User";
          
          return {
            id: req.id,
            userId: req.user_id,
            taskId: req.task_id,
            status: req.status as "pending" | "approved" | "rejected",
            createdAt: req.created_at,
            updatedAt: req.updated_at || undefined,
            reviewedBy: req.reviewed_by || undefined,
            taskTitle: req.tasks?.title || "Unknown Task",
            pointValue: req.tasks?.points_value || 0,
            username: username,
            photoUrl: req.photo_url || null,
            comment: req.comment || null
          };
        }) || [];
        
        setRequests(formattedRequests);
        
        // Fetch custom requests
        const { data: customRequestsData, error: customRequestsError } = await supabase
          .from("custom_requests")
          .select(`
            *,
            profiles:user_id(username)
          `)
          .order("created_at", { ascending: false });
        
        if (customRequestsError) throw customRequestsError;
        
        // Safety check for profiles and casting
        const formattedCustomRequests: CustomRequest[] = customRequestsData?.map(req => {
          const username = req.profiles ? 
            (typeof req.profiles === 'object' && 'username' in req.profiles ? req.profiles.username : "Unknown User") :
            "Unknown User";
          
          return {
            id: req.id,
            userId: req.user_id,
            title: req.title,
            description: req.description,
            type: req.type as "task" | "reward" | "other",
            status: req.status as "pending" | "approved" | "rejected",
            createdAt: req.created_at,
            updatedAt: req.updated_at,
            reviewedBy: req.reviewed_by,
            username: username
          };
        }) || [];
        
        setCustomRequests(formattedCustomRequests);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Listen for realtime updates
    const subscribeToUpdates = () => {
      const taskSubscription = supabase
        .channel("tasks-channel")
        .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchData)
        .subscribe();
      
      const rewardSubscription = supabase
        .channel("rewards-channel")
        .on("postgres_changes", { event: "*", schema: "public", table: "rewards" }, fetchData)
        .subscribe();
      
      const requestSubscription = supabase
        .channel("point-requests-channel")
        .on("postgres_changes", { event: "*", schema: "public", table: "point_requests" }, fetchData)
        .subscribe();
      
      const customRequestSubscription = supabase
        .channel("custom-requests-channel")
        .on("postgres_changes", { event: "*", schema: "public", table: "custom_requests" }, fetchData)
        .subscribe();
      
      return () => {
        taskSubscription.unsubscribe();
        rewardSubscription.unsubscribe();
        requestSubscription.unsubscribe();
        customRequestSubscription.unsubscribe();
      };
    };
    
    const unsubscribe = subscribeToUpdates();
    return unsubscribe;
  }, [currentUser]);

  // Create task
  const createTask = async (task: Omit<Task, "id" | "createdAt">) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Only administrators can create tasks");
      }
      
      // Map task to database schema
      const dbTask = {
        title: task.title,
        description: task.description,
        points_value: task.pointValue,
        recurring: task.autoReset,
        created_by: currentUser.id,
      };
      
      const { error } = await supabase.from("tasks").insert(dbTask);
      
      if (error) throw error;
      
      toast({
        title: "Task created",
        description: "A new task has been created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update task
  const updateTask = async (id: string, task: Partial<Task>) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Only administrators can update tasks");
      }
      
      // Map task to database schema
      const dbTask: any = {};
      if (task.title !== undefined) dbTask.title = task.title;
      if (task.description !== undefined) dbTask.description = task.description;
      if (task.pointValue !== undefined) dbTask.points_value = task.pointValue;
      if (task.autoReset !== undefined) dbTask.recurring = task.autoReset;
      
      const { error } = await supabase
        .from("tasks")
        .update(dbTask)
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Task updated",
        description: "The task has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Only administrators can delete tasks");
      }
      
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Create reward
  const createReward = async (reward: Omit<Reward, "id" | "createdAt">) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Only administrators can create rewards");
      }
      
      // Map reward to database schema
      const dbReward = {
        title: reward.title,
        description: reward.description,
        points_cost: reward.pointCost,
        requires_approval: reward.approvalKeyRequired,
      };
      
      const { error } = await supabase.from("rewards").insert(dbReward);
      
      if (error) throw error;
      
      toast({
        title: "Reward created",
        description: "A new reward has been created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to create reward",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update reward
  const updateReward = async (id: string, reward: Partial<Reward>) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Only administrators can update rewards");
      }
      
      // Map reward to database schema
      const dbReward: any = {};
      if (reward.title !== undefined) dbReward.title = reward.title;
      if (reward.description !== undefined) dbReward.description = reward.description;
      if (reward.pointCost !== undefined) dbReward.points_cost = reward.pointCost;
      if (reward.approvalKeyRequired !== undefined) dbReward.requires_approval = reward.approvalKeyRequired;
      
      const { error } = await supabase
        .from("rewards")
        .update(dbReward)
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Reward updated",
        description: "The reward has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update reward",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete reward
  const deleteReward = async (id: string) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Only administrators can delete rewards");
      }
      
      const { error } = await supabase
        .from("rewards")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Reward deleted",
        description: "The reward has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete reward",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Redeem reward
  const redeemReward = async (rewardId: string) => {
    try {
      if (!currentUser) {
        throw new Error("You must be logged in to redeem rewards");
      }
      
      // Get reward details
      const { data: reward, error: rewardError } = await supabase
        .from("rewards")
        .select("*")
        .eq("id", rewardId)
        .single();
      
      if (rewardError) throw rewardError;
      if (!reward) throw new Error("Reward not found");
      
      // Check if user has enough points
      if (currentUser.points < reward.points_cost) {
        throw new Error(`Not enough points. You need ${reward.points_cost} points to redeem this reward.`);
      }
      
      // Use a transaction or batch operations
      const newPoints = currentUser.points - reward.points_cost;
      
      // First update user's points
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ points: newPoints })
        .eq("id", currentUser.id);
      
      if (updateError) throw updateError;
      
      // Then record the redemption 
      // Note: if your DB schema has a table for redemptions, use that instead
      const { error: historyError } = await supabase
        .from("points_history")
        .insert({
          user_id: currentUser.id,
          points: -reward.points_cost, // Negative points since it's a reduction
          new_total: newPoints,
          reason: `Redeemed reward: ${reward.title}`,
          type: "redemption"
        });
      
      if (historyError) throw historyError;
      
      toast({
        title: "Reward redeemed",
        description: `You have successfully redeemed ${reward.title} for ${reward.points_cost} points`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to redeem reward",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Create point request
  const createPointRequest = async (taskId: string, photoUrl?: string | null, comment?: string | null) => {
    try {
      if (!currentUser) {
        throw new Error("You must be logged in to request points");
      }
      
      // Check if task exists
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select("id")
        .eq("id", taskId)
        .single();
      
      if (taskError) throw taskError;
      if (!task) throw new Error("Task not found");
      
      // Create point request
      const { error } = await supabase
        .from("point_requests")
        .insert({
          user_id: currentUser.id,
          task_id: taskId,
          photo_url: photoUrl || null,
          comment: comment || null
        });
      
      if (error) throw error;
      
      toast({
        title: "Request submitted",
        description: "Your task completion request has been submitted for review",
      });
    } catch (error: any) {
      toast({
        title: "Failed to submit request",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Review point request
  const reviewPointRequest = async (requestId: string, approved: boolean) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Only administrators can review point requests");
      }
      
      // Get request details
      const { data: request, error: requestError } = await supabase
        .from("point_requests")
        .select("*, tasks:task_id(points_value)")
        .eq("id", requestId)
        .single();
      
      if (requestError) throw requestError;
      if (!request) throw new Error("Request not found");
      
      // Update request status
      const { error: updateError } = await supabase
        .from("point_requests")
        .update({
          status: approved ? "approved" : "rejected",
          reviewed_by: currentUser.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId);
      
      if (updateError) throw updateError;
      
      // If approved, award points to the user
      if (approved) {
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("points")
          .eq("id", request.user_id)
          .single();
        
        if (userError) throw userError;
        
        const newPoints = (userData?.points || 0) + request.tasks.points_value;
        
        const { error: pointsError } = await supabase
          .from("profiles")
          .update({ points: newPoints })
          .eq("id", request.user_id);
        
        if (pointsError) throw pointsError;
      }
      
      toast({
        title: `Request ${approved ? 'approved' : 'rejected'}`,
        description: approved 
          ? `Points have been awarded to the user`
          : `The request has been rejected`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to review request",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Create custom request
  const createCustomRequest = async (request: Omit<CustomRequest, "id" | "status" | "userId" | "createdAt" | "username">) => {
    try {
      if (!currentUser) {
        throw new Error("You must be logged in to create custom requests");
      }
      
      const { error } = await supabase
        .from("custom_requests")
        .insert({
          user_id: currentUser.id,
          title: request.title,
          description: request.description,
          type: request.type,
          status: "pending"
        });
      
      if (error) throw error;
      
      toast({
        title: "Request submitted",
        description: `Your ${request.type} request has been submitted for review`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to submit request",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Review custom request
  const reviewCustomRequest = async (requestId: string, approved: boolean) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Only administrators can review custom requests");
      }
      
      const { error } = await supabase
        .from("custom_requests")
        .update({
          status: approved ? "approved" : "rejected",
          reviewed_by: currentUser.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId);
      
      if (error) throw error;
      
      toast({
        title: `Request ${approved ? 'approved' : 'rejected'}`,
        description: approved 
          ? "Custom request has been approved. You can now create the requested item."
          : "The custom request has been rejected",
      });
    } catch (error: any) {
      toast({
        title: "Failed to review request",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Alias methods
  const addTask = createTask;
  const addReward = createReward;

  const value = {
    tasks,
    rewards,
    requests,
    customRequests,
    loading,
    createTask,
    updateTask,
    deleteTask,
    createReward,
    updateReward,
    deleteReward,
    redeemReward,
    createPointRequest,
    reviewPointRequest,
    createCustomRequest,
    reviewCustomRequest,
    // Aliases
    addTask,
    addReward,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Custom hook to use data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
