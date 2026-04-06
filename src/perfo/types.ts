export type Role = "admin" | "user";
export type RequestStatus = "pending" | "approved" | "denied";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  pointValue: number;
  deadline: string;
  autoReset: boolean;
  assignedTo: string | "all";
  keyRewardType: string;
  keyRewardQuantity: number;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointCost: number;
  icon: string;
  approvalKeyRequired: boolean;
  requiredKeyType: string;
  requiredKeyQuantity: number;
}

export interface EarnedHistoryItem {
  id: string;
  taskId: string;
  task: string;
  points: number;
  date: string;
}

export interface SpentHistoryItem {
  id: string;
  rewardId: string;
  reward: string;
  cost: number;
  date: string;
}

export interface FamilyUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: Role;
  points: number;
  blocked: boolean;
  avatar: string;
  earnedHistory: EarnedHistoryItem[];
  spentHistory: SpentHistoryItem[];
  keys: UserKeyInventory[];
  salahEnabled: boolean;
  salahGoal: number;
  salahCompletedToday: number;
}

export interface PointRequestItem {
  id: string;
  userId: string;
  taskId: string;
  status: RequestStatus;
  timeStamp: string;
  note: string;
  photoUrl: string;
}

export interface ActivityLogItem {
  id: string;
  userId: string | null;
  actor: string;
  action: string;
  detail: string;
  timeStamp: string;
}

export interface FamilyAppState {
  users: FamilyUser[];
  tasks: TaskItem[];
  rewards: RewardItem[];
  pointRequests: PointRequestItem[];
  activityLogs: ActivityLogItem[];
  dailyRedemptionLimit: number;
}

export interface UserKeyInventory {
  keyType: string;
  quantity: number;
}

export interface TaskFormState {
  title: string;
  description: string;
  pointValue: string;
  deadline: string;
  autoReset: boolean;
  assignedTo: string | "all";
  keyRewardType: string;
  keyRewardQuantity: string;
}

export interface RewardFormState {
  title: string;
  description: string;
  pointCost: string;
  icon: string;
  approvalKeyRequired: boolean;
  requiredKeyType: string;
  requiredKeyQuantity: string;
}

export interface UserFormState {
  email: string;
  username: string;
  displayName: string;
  password: string;
  avatar: string;
}

export interface UserEditFormState {
  username: string;
  displayName: string;
  email: string;
}
