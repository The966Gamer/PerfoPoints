
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTasks } from "@/hooks/data/useTasks";
import { useRewards } from "@/hooks/data/useRewards";
import { usePointRequests } from "@/hooks/data/usePointRequests";
import { useCustomRequests } from "@/hooks/data/useCustomRequests";
import { useUsers } from "@/hooks/data/useUsers";
import { PointRequest, CustomRequest, Task, Reward, User } from "@/types";

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

// Context provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  // Use the individual hooks
  const taskHooks = useTasks();
  const rewardHooks = useRewards();
  const pointRequestHooks = usePointRequests();
  const customRequestHooks = useCustomRequests();
  const userHooks = useUsers();

  // Combine all loading states
  const loading = 
    taskHooks.loading || 
    rewardHooks.loading || 
    pointRequestHooks.loading || 
    customRequestHooks.loading;

  // Load data on first mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        pointRequestHooks.fetchPointRequests(),
        customRequestHooks.fetchCustomRequests(),
        taskHooks.fetchAllTasks(),
        rewardHooks.fetchAllRewards()
      ]);
    };
    
    loadData();
  }, []);

  const value: DataContextType = {
    pointRequests: pointRequestHooks.pointRequests,
    customRequests: customRequestHooks.customRequests,
    tasks: taskHooks.tasks,
    rewards: rewardHooks.rewards,
    requests: pointRequestHooks.pointRequests, // Alias for compatibility
    loading,
    fetchPointRequests: pointRequestHooks.fetchPointRequests,
    fetchCustomRequests: customRequestHooks.fetchCustomRequests,
    fetchAllTasks: taskHooks.fetchAllTasks,
    fetchAllRewards: rewardHooks.fetchAllRewards,
    createTask: taskHooks.createTask,
    createReward: rewardHooks.createReward,
    updateTask: taskHooks.updateTask,
    updateReward: rewardHooks.updateReward,
    deleteTask: taskHooks.deleteTask,
    deleteReward: rewardHooks.deleteReward,
    submitPointRequest: pointRequestHooks.submitPointRequest,
    submitCustomRequest: customRequestHooks.submitCustomRequest,
    reviewPointRequest: pointRequestHooks.reviewPointRequest,
    reviewCustomRequest: customRequestHooks.reviewCustomRequest,
    updateUserProfile: userHooks.updateUserProfile,
    createPointRequest: pointRequestHooks.createPointRequest,
    redeemReward: rewardHooks.redeemReward,
    addTask: taskHooks.addTask,
    addReward: rewardHooks.addReward
  };

  return (
    <QueryClientProvider client={queryClient}>
      <DataContext.Provider value={value}>
        {children}
      </DataContext.Provider>
    </QueryClientProvider>
  );
};
