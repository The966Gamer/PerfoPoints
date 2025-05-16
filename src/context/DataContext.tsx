import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { Task, Reward, PointRequest, PointTransaction, CustomRequest } from "@/types";
import { useAuth } from "./AuthContext";

// Mock data for demo purposes - this would be replaced with Firebase
const DEMO_TASKS: Task[] = [
  {
    id: "task1",
    title: "Clean Room",
    description: "Make your bed and pick up toys",
    pointValue: 15,
    autoReset: true,
    createdAt: new Date().toISOString(),
    createdBy: "admin1",
  },
  {
    id: "task2",
    title: "Do Homework",
    description: "Complete today's assignments",
    pointValue: 20,
    autoReset: true,
    createdAt: new Date().toISOString(),
    createdBy: "admin1",
  },
  {
    id: "task3",
    title: "Take Out Trash",
    description: "Empty all trash cans in the house",
    pointValue: 10,
    autoReset: true,
    createdAt: new Date().toISOString(),
    createdBy: "admin1",
  }
];

const DEMO_REWARDS: Reward[] = [
  {
    id: "reward1",
    title: "Extra Screen Time",
    description: "30 minutes of extra screen time",
    pointCost: 50,
    approvalKeyRequired: true,
    createdAt: new Date().toISOString(),
    createdBy: "admin1",
  },
  {
    id: "reward2",
    title: "Special Snack",
    description: "Choose a special snack",
    pointCost: 30,
    approvalKeyRequired: true,
    createdAt: new Date().toISOString(),
    createdBy: "admin1",
  },
  {
    id: "reward3",
    title: "Stay Up Late",
    description: "Stay up 30 minutes past bedtime",
    pointCost: 75,
    approvalKeyRequired: true,
    createdAt: new Date().toISOString(),
    createdBy: "admin1",
  }
];

const DEMO_REQUESTS: PointRequest[] = [
  {
    id: "request1",
    userId: "user1",
    username: "child1",
    taskId: "task1",
    taskTitle: "Clean Room",
    pointValue: 15,
    status: "pending",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  }
];

const DEMO_TRANSACTIONS: PointTransaction[] = [
  {
    id: "trans1",
    userId: "user1",
    amount: 20,
    type: "earned",
    description: "Completed task: Do Homework",
    relatedTaskId: "task2",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "trans2",
    userId: "user1",
    amount: -30,
    type: "spent",
    description: "Redeemed reward: Special Snack",
    relatedRewardId: "reward2",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "trans3",
    userId: "user2",
    amount: 35,
    type: "earned",
    description: "Completed tasks: Clean Room + Take Out Trash",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  }
];

const DEMO_CUSTOM_REQUESTS: CustomRequest[] = [];

interface DataContextType {
  tasks: Task[];
  rewards: Reward[];
  requests: PointRequest[];
  transactions: PointTransaction[];
  customRequests: CustomRequest[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "createdBy">) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addReward: (reward: Omit<Reward, "id" | "createdAt" | "createdBy">) => Promise<void>;
  updateReward: (reward: Reward) => Promise<void>;
  deleteReward: (rewardId: string) => Promise<void>;
  createPointRequest: (taskId: string) => Promise<void>;
  reviewPointRequest: (requestId: string, approved: boolean) => Promise<void>;
  redeemReward: (rewardId: string) => Promise<void>;
  getUserTransactions: (userId: string) => PointTransaction[];
  createCustomRequest: (request: Omit<CustomRequest, "id" | "status" | "createdAt" | "userId" | "username">) => Promise<void>;
  reviewCustomRequest: (requestId: string, approved: boolean) => Promise<void>;
  sendMessage: (userId: string, message: string) => Promise<void>;
  giftPoints: (fromUserId: string, toUserId: string, amount: number, message?: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, updateUserPoints } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);
  const [rewards, setRewards] = useState<Reward[]>(DEMO_REWARDS);
  const [requests, setRequests] = useState<PointRequest[]>(DEMO_REQUESTS);
  const [transactions, setTransactions] = useState<PointTransaction[]>(DEMO_TRANSACTIONS);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>(DEMO_CUSTOM_REQUESTS);

  const addTask = async (taskData: Omit<Task, "id" | "createdAt" | "createdBy">) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        toast.error("Only admins can add tasks");
        return;
      }

      const newTask: Task = {
        ...taskData,
        id: `task${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
      };

      setTasks(prev => [...prev, newTask]);
      toast.success("Task added successfully");
    } catch (error) {
      console.error("Add task error:", error);
      toast.error("Failed to add task");
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        toast.error("Only admins can update tasks");
        return;
      }

      setTasks(prev =>
        prev.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
      
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Update task error:", error);
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        toast.error("Only admins can delete tasks");
        return;
      }

      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Delete task error:", error);
      toast.error("Failed to delete task");
    }
  };

  const addReward = async (rewardData: Omit<Reward, "id" | "createdAt" | "createdBy">) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        toast.error("Only admins can add rewards");
        return;
      }

      const newReward: Reward = {
        ...rewardData,
        id: `reward${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
      };

      setRewards(prev => [...prev, newReward]);
      toast.success("Reward added successfully");
    } catch (error) {
      console.error("Add reward error:", error);
      toast.error("Failed to add reward");
    }
  };

  const updateReward = async (updatedReward: Reward) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        toast.error("Only admins can update rewards");
        return;
      }

      setRewards(prev =>
        prev.map(reward =>
          reward.id === updatedReward.id ? updatedReward : reward
        )
      );
      
      toast.success("Reward updated successfully");
    } catch (error) {
      console.error("Update reward error:", error);
      toast.error("Failed to update reward");
    }
  };

  const deleteReward = async (rewardId: string) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        toast.error("Only admins can delete rewards");
        return;
      }

      setRewards(prev => prev.filter(reward => reward.id !== rewardId));
      toast.success("Reward deleted successfully");
    } catch (error) {
      console.error("Delete reward error:", error);
      toast.error("Failed to delete reward");
    }
  };

  const createPointRequest = async (taskId: string) => {
    try {
      if (!currentUser) {
        toast.error("You must be logged in to request points");
        return;
      }

      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        toast.error("Task not found");
        return;
      }

      // Check if there's already a pending request for this task
      const existingRequest = requests.find(
        r => r.userId === currentUser.id && r.taskId === taskId && r.status === "pending"
      );

      if (existingRequest) {
        toast.error("You already have a pending request for this task");
        return;
      }

      const newRequest: PointRequest = {
        id: `request${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.username || 'Unknown User',
        taskId: task.id,
        taskTitle: task.title,
        pointValue: task.pointValue,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      setRequests(prev => [...prev, newRequest]);
      toast.success("Point request submitted for review");
    } catch (error) {
      console.error("Create point request error:", error);
      toast.error("Failed to submit point request");
    }
  };

  const reviewPointRequest = async (requestId: string, approved: boolean) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        toast.error("Only admins can review point requests");
        return;
      }

      const request = requests.find(r => r.id === requestId);
      if (!request) {
        toast.error("Request not found");
        return;
      }

      if (request.status !== "pending") {
        toast.error("This request has already been reviewed");
        return;
      }

      const updatedRequest: PointRequest = {
        ...request,
        status: approved ? "approved" : "denied",
        reviewedBy: currentUser.id,
        reviewedAt: new Date().toISOString(),
      };

      setRequests(prev =>
        prev.map(req =>
          req.id === requestId ? updatedRequest : req
        )
      );

      if (approved) {
        // Add points to user
        await updateUserPoints(request.userId, request.pointValue);
        
        // Create transaction record
        const newTransaction: PointTransaction = {
          id: `trans${Date.now()}`,
          userId: request.userId,
          amount: request.pointValue,
          type: "earned",
          description: `Completed task: ${request.taskTitle}`,
          relatedTaskId: request.taskId,
          createdAt: new Date().toISOString(),
        };
        
        setTransactions(prev => [...prev, newTransaction]);
        toast.success(`Approved ${request.pointValue} points for ${request.username}`);
      } else {
        toast.info(`Denied points request from ${request.username}`);
      }
    } catch (error) {
      console.error("Review point request error:", error);
      toast.error("Failed to review point request");
    }
  };

  const redeemReward = async (rewardId: string) => {
    try {
      if (!currentUser) {
        toast.error("You must be logged in to redeem rewards");
        return;
      }

      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) {
        toast.error("Reward not found");
        return;
      }

      if (currentUser.points && currentUser.points < reward.pointCost) {
        toast.error("You don't have enough points for this reward");
        return;
      }

      // Deduct points from user
      await updateUserPoints(currentUser.id, -reward.pointCost);
      
      // Create transaction record
      const newTransaction: PointTransaction = {
        id: `trans${Date.now()}`,
        userId: currentUser.id,
        amount: -reward.pointCost,
        type: "spent",
        description: `Redeemed reward: ${reward.title}`,
        relatedRewardId: reward.id,
        createdAt: new Date().toISOString(),
      };
      
      setTransactions(prev => [...prev, newTransaction]);
      
      if (reward.approvalKeyRequired) {
        toast.success(`Reward redeemed! Show this to your parent for approval.`, {
          description: `Reward: ${reward.title}`,
          duration: 5000,
        });
      } else {
        toast.success(`Reward redeemed: ${reward.title}`);
      }
    } catch (error) {
      console.error("Redeem reward error:", error);
      toast.error("Failed to redeem reward");
    }
  };

  const createCustomRequest = async (requestData: Omit<CustomRequest, "id" | "status" | "createdAt" | "userId" | "username">) => {
    try {
      if (!currentUser) {
        toast.error("You must be logged in to submit a request");
        return;
      }

      const newRequest: CustomRequest = {
        ...requestData,
        id: `custom${Date.now()}`,
        status: "pending",
        userId: currentUser.id,
        username: currentUser.username,
        createdAt: new Date().toISOString(),
      };

      setCustomRequests(prev => [...prev, newRequest]);
      toast.success("Your request has been submitted for review");
    } catch (error) {
      console.error("Create custom request error:", error);
      toast.error("Failed to submit request");
    }
  };

  const reviewCustomRequest = async (requestId: string, approved: boolean) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        toast.error("Only admins can review requests");
        return;
      }

      const request = customRequests.find(r => r.id === requestId);
      if (!request) {
        toast.error("Request not found");
        return;
      }

      if (request.status !== "pending") {
        toast.error("This request has already been reviewed");
        return;
      }

      const updatedRequest: CustomRequest = {
        ...request,
        status: approved ? "approved" : "denied",
        reviewedBy: currentUser.id,
        reviewedAt: new Date().toISOString(),
      };

      setCustomRequests(prev =>
        prev.map(req =>
          req.id === requestId ? updatedRequest : req
        )
      );

      if (approved) {
        toast.success(`Approved request from ${request.username}`);
      } else {
        toast.info(`Denied request from ${request.username}`);
      }
    } catch (error) {
      console.error("Review custom request error:", error);
      toast.error("Failed to review request");
    }
  };

  const sendMessage = async (userId: string, message: string) => {
    try {
      if (!currentUser) {
        toast.error("You must be logged in to send messages");
        return;
      }

      // In a real app, this would save to a database
      console.log(`Message from ${currentUser.id} to ${userId}: ${message}`);
      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message");
    }
  };

  const giftPoints = async (fromUserId: string, toUserId: string, amount: number, message?: string) => {
    try {
      if (!currentUser) {
        toast.error("You must be logged in to gift points");
        return;
      }

      if (amount <= 0) {
        toast.error("Gift amount must be greater than zero");
        return;
      }

      // Check if user has enough points
      if (currentUser.points < amount) {
        toast.error("You don't have enough points to gift");
        return;
      }

      // Deduct points from current user
      await updateUserPoints(fromUserId, -amount);
      
      // Add points to recipient
      await updateUserPoints(toUserId, amount);
      
      // Create transaction records
      const newSentTransaction: PointTransaction = {
        id: `trans${Date.now()}-sent`,
        userId: fromUserId,
        amount: -amount,
        type: "spent",
        description: `Gifted points to ${toUserId}${message ? `: "${message}"` : ''}`,
        createdAt: new Date().toISOString(),
      };
      
      const newReceivedTransaction: PointTransaction = {
        id: `trans${Date.now()}-received`,
        userId: toUserId,
        amount: amount,
        type: "earned",
        description: `Received gift from ${fromUserId}${message ? `: "${message}"` : ''}`,
        createdAt: new Date().toISOString(),
      };
      
      setTransactions(prev => [...prev, newSentTransaction, newReceivedTransaction]);
      
      toast.success(`Successfully gifted ${amount} points`);
    } catch (error) {
      console.error("Gift points error:", error);
      toast.error("Failed to gift points");
    }
  };

  const getUserTransactions = (userId: string): PointTransaction[] => {
    return transactions.filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  return (
    <DataContext.Provider
      value={{
        tasks,
        rewards,
        requests,
        transactions,
        customRequests,
        addTask,
        updateTask,
        deleteTask,
        addReward,
        updateReward,
        deleteReward,
        createPointRequest,
        reviewPointRequest,
        redeemReward,
        getUserTransactions,
        createCustomRequest,
        reviewCustomRequest,
        sendMessage,
        giftPoints,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
