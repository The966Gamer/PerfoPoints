
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  points: number;
  avatarUrl?: string;
  isBlocked?: boolean;
  createdAt: string;
  email?: string;
  emailVerified?: boolean;
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

// Database mapping types
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

// Database to frontend mapping interfaces
export interface DbToFrontendMappings {
  // Task database mapping
  DbTask: {
    id: string;
    title: string;
    description: string;
    points_value: number;
    recurring: boolean;
    created_at: string;
    created_by: string;
  };
  
  // Profile database mapping
  DbProfile: {
    id: string;
    username: string;
    full_name: string;
    email?: string;
    email_verified: boolean;
    role: string;
    points: number;
    is_blocked: boolean;
    avatar_url?: string;
    created_at: string;
  };
  
  // Custom request database mapping
  DbCustomRequest: {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    type: string;
    status: string;
    created_at: string;
    updated_at?: string;
    reviewed_by?: string;
  };
  
  // Type for database redemption
  DbRedemption: {
    id: string;
    user_id: string;
    reward_id: string;
    points_cost: number;
    created_at: string;
  };
}
