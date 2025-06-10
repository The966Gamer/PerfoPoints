
export interface User {
  id: string;
  username: string;
  fullName?: string; // Add fullName field
  role: 'admin' | 'user';
  points: number;
  avatarUrl?: string;
  isBlocked?: boolean;
  createdAt: string;
  email?: string;
  emailVerified?: boolean;
  // Add these fields to align with the database structure
  created_at?: string;
  email_verified?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  pointValue: number;
  deadline?: string | null;
  autoReset: boolean;
  createdAt: string;
  createdBy: string | null;
  category?: string;
  status?: 'active' | 'inactive';
  recurring?: boolean; // Add recurring field
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointCost: number;
  image?: string;
  approvalKeyRequired: boolean;
  createdAt: string;
  createdBy: string | null;
  category?: string;
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

// User Meter interface
export interface UserMeter {
  id: string;
  userId: string;
  meterType: string;
  currentPercentage: number;
  targetPercentage: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  completedAt?: string;
  prizeUnlocked: boolean;
  description?: string;
  username?: string; // For display purposes
}

// Meter History interface
export interface MeterHistory {
  id: string;
  meterId: string;
  userId: string;
  oldPercentage: number;
  newPercentage: number;
  changeAmount: number;
  changeReason?: string;
  changedBy?: string;
  changedAt: string;
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

  // User meter database mapping
  DbUserMeter: {
    id: string;
    user_id: string;
    meter_type: string;
    current_percentage: number;
    target_percentage: number;
    is_active: boolean;
    created_by?: string;
    created_at: string;
    completed_at?: string;
    prize_unlocked: boolean;
    description?: string;
  };
}

// Extended user interface for admin functionality
export interface ExtendedUser extends User {
  app_metadata?: any;
  user_metadata?: any;
  aud?: string;
}

// Achievement interface for gamification
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  pointsRequired: number;
  achieved: boolean;
}

// Key type for special features
export interface Key {
  id: string;
  userId: string;
  keyType: 'gold' | 'silver' | 'bronze';
  quantity: number;
}

// Daily streak tracking
export interface Streak {
  userId: string;
  currentStreak: number;
  lastActivity: string;
  longestStreak: number;
}

// Add any missing interfaces or types needed for the AdminGiftDialog
export interface AdminGiftDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onSuccess?: () => void;
}
