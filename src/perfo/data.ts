import { FamilyAppState, RewardFormState, TaskFormState, UserFormState } from "@/perfo/types";

export const STORAGE_KEY = "perfopoints-family-state";
export const SESSION_KEY = "perfopoints-session-user";
export const defaultAvatars = ["Rocket", "Tiger", "Koala", "Dragon", "Panda", "Fox"];

export const emptyTaskForm: TaskFormState = {
  title: "",
  description: "",
  pointValue: "10",
  deadline: "",
  autoReset: false,
  assignedTo: "all",
  keyRewardType: "",
  keyRewardQuantity: "1",
};

export const emptyRewardForm: RewardFormState = {
  title: "",
  description: "",
  pointCost: "25",
  icon: "🎁",
  approvalKeyRequired: false,
  requiredKeyType: "",
  requiredKeyQuantity: "1",
};

export const emptyUserForm: UserFormState = {
  email: "",
  username: "",
  displayName: "",
  password: "",
  avatar: defaultAvatars[0],
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}
