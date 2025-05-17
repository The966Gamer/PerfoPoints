
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  points: number;
  avatarUrl?: string;
  isBlocked?: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  pointValue: number;
  deadline?: string;
  autoReset: boolean;
  createdAt: string;
  createdBy: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointCost: number;
  image?: string;
  approvalKeyRequired: boolean;
  createdAt: string;
  createdBy: string;
}

// Point Request type
export interface PointRequest {
  id: string;
  userId: string;
  taskId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt?: string;
  reviewedBy?: string;
  taskTitle: string;
  pointValue: number;
  username: string;
  photoUrl?: string | null;
  comment?: string | null;
}

// Custom Request type
export interface CustomRequest {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: "task" | "reward" | "other";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt?: string;
  reviewedBy?: string;
  username: string;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

// Map types from database column names to our frontend naming convention
export interface DbPointRequest {
  id: string;
  user_id: string;
  task_id: string;
  status: string;
  created_at: string;
  updated_at?: string;
  reviewed_by?: string;
  photo_url?: string | null;
  comment?: string | null;
}

export interface DbReward {
  id: string;
  title: string;
  description: string;
  points_cost: number;
  requires_approval: boolean;
  category?: string;
}
