
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

export interface PointRequest {
  id: string;
  userId: string;
  username: string;
  taskId: string;
  taskTitle: string;
  pointValue: number;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent';
  description: string;
  relatedTaskId?: string;
  relatedRewardId?: string;
  createdAt: string;
}

export interface CustomRequest {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  type: 'reward' | 'task' | 'other';
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  read: boolean;
  createdAt: string;
}
