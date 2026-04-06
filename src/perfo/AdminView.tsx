import { FormEvent } from "react";
import { Activity, CheckCircle2, ClipboardCheck, Gift, Plus, Shield, UserRound, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeader, StatCard } from "@/perfo/PerfoBits";
import { defaultAvatars, emptyRewardForm, emptyTaskForm, formatDate } from "@/perfo/data";
import { FamilyAppState, RewardFormState, TaskFormState, UserEditFormState, UserFormState } from "@/perfo/types";

interface AdminViewProps {
  appState: FamilyAppState;
  kids: FamilyAppState["users"];
  pendingRequests: FamilyAppState["pointRequests"];
  taskForm: TaskFormState;
  setTaskForm: React.Dispatch<React.SetStateAction<TaskFormState>>;
  rewardForm: RewardFormState;
  setRewardForm: React.Dispatch<React.SetStateAction<RewardFormState>>;
  userForm: UserFormState;
  setUserForm: React.Dispatch<React.SetStateAction<UserFormState>>;
  editingTaskId: string | null;
  setEditingTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  editingRewardId: string | null;
  setEditingRewardId: React.Dispatch<React.SetStateAction<string | null>>;
  onUserSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTaskSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRewardSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReviewRequest: (requestId: string, status: "approved" | "denied") => void;
  onAssignBonus: (userId: string, amount: number) => void;
  onGrantKey: (userId: string, keyType: string, quantity: number) => void;
  onResetPassword: (userId: string) => void;
  onToggleBlocked: (userId: string) => void;
  onResetCompletedTasks: (userId: string) => void;
  editingUserId: string | null;
  userEditForm: UserEditFormState;
  setUserEditForm: React.Dispatch<React.SetStateAction<UserEditFormState>>;
  onStartEditUser: (userId: string) => void;
  onSaveUser: () => void;
  onSalahSettings: (userId: string, enabled: boolean, dailyGoal: number) => void;
  onStartEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onStartEditReward: (rewardId: string) => void;
  onDeleteReward: (rewardId: string) => void;
  onDailyLimitChange: (value: number) => void;
}

export function AdminView(props: AdminViewProps) {
  const {
    appState,
    kids,
    pendingRequests,
    taskForm,
    setTaskForm,
    rewardForm,
    setRewardForm,
    userForm,
    setUserForm,
    editingTaskId,
    setEditingTaskId,
    editingRewardId,
    setEditingRewardId,
    onUserSubmit,
    onTaskSubmit,
    onRewardSubmit,
    onReviewRequest,
    onAssignBonus,
    onGrantKey,
    onResetPassword,
    onToggleBlocked,
    onResetCompletedTasks,
    editingUserId,
    userEditForm,
    setUserEditForm,
    onStartEditUser,
    onSaveUser,
    onSalahSettings,
    onStartEditTask,
    onDeleteTask,
    onStartEditReward,
    onDeleteReward,
    onDailyLimitChange,
  } = props;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<UserRound />} label="Kids" value={kids.length} />
        <StatCard icon={<ClipboardCheck />} label="Pending requests" value={pendingRequests.length} />
        <StatCard icon={<Gift />} label="Rewards" value={appState.rewards.length} />
        <StatCard icon={<Activity />} label="Activity logs" value={appState.activityLogs.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <CardHeader>
            <SectionHeader icon={<ClipboardCheck className="h-5 w-5" />} title="Point requests" description="Approve or deny completed task submissions from kids." />
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-sky-300/60 bg-sky-50/70 p-6 text-sm text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200">
                No pending requests right now.
              </div>
            ) : (
              pendingRequests.map((request) => {
                const kid = appState.users.find((user) => user.id === request.userId);
                const task = appState.tasks.find((entry) => entry.id === request.taskId);
                if (!kid || !task) return null;

                return (
                  <div key={request.id} className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/75">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-lg font-semibold">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {kid.displayName} requested {task.pointValue} points on {formatDate(request.timeStamp)}
                        </p>
                        {request.note ? <p className="mt-2 text-sm">Note: {request.note}</p> : null}
                        {request.photoUrl ? (
                          <img
                            src={request.photoUrl}
                            alt={`${task.title} proof from ${kid.displayName}`}
                            className="mt-3 h-40 w-full max-w-md rounded-2xl object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => onReviewRequest(request.id, "approved")} className="rounded-full">
                          <CheckCircle2 className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button variant="outline" onClick={() => onReviewRequest(request.id, "denied")} className="rounded-full">
                          <XCircle className="h-4 w-4" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <CardHeader>
            <SectionHeader icon={<Shield className="h-5 w-5" />} title="Family settings" description="Control the pace of redemptions and keep the system fair." />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-white/60 bg-white/75 p-4 dark:border-white/10 dark:bg-slate-900/70">
              <label className="mb-2 block text-sm font-medium">Daily reward limit per child</label>
              <Input type="number" min="1" value={appState.dailyRedemptionLimit} onChange={(event) => onDailyLimitChange(Number(event.target.value) || 1)} />
            </div>
            <div className="rounded-3xl border border-dashed border-orange-300/70 bg-orange-50/80 p-4 text-sm text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-200">
              Password resets generate a new password in the toast message. Approval-key rewards already work in the kid dashboard.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <CardHeader>
            <SectionHeader icon={<Plus className="h-5 w-5" />} title="Add child" description="Create a new kid account without touching code." />
          </CardHeader>
          <form onSubmit={onUserSubmit}>
            <CardContent className="space-y-3">
              <Input placeholder="Username" value={userForm.username} onChange={(event) => setUserForm((previous) => ({ ...previous, username: event.target.value }))} />
              <Input placeholder="Display name" value={userForm.displayName} onChange={(event) => setUserForm((previous) => ({ ...previous, displayName: event.target.value }))} />
              <Input type="email" placeholder="Email" value={userForm.email} onChange={(event) => setUserForm((previous) => ({ ...previous, email: event.target.value }))} />
              <Input type="password" placeholder="Password" value={userForm.password} onChange={(event) => setUserForm((previous) => ({ ...previous, password: event.target.value }))} />
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={userForm.avatar} onChange={(event) => setUserForm((previous) => ({ ...previous, avatar: event.target.value }))}>
                {defaultAvatars.map((avatar) => <option key={avatar} value={avatar}>{avatar}</option>)}
              </select>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full rounded-full">
                <Plus className="h-4 w-4" />
                Create user
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="xl:col-span-2 border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <CardHeader>
            <SectionHeader icon={<UserRound className="h-5 w-5" />} title="User controls" description="Edit users, reset passwords, gift keys, manage Salah, and reopen one-time tasks." />
          </CardHeader>
          <CardContent className="space-y-3">
            {kids.map((kid) => (
              <div key={kid.id} className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/75">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold">{kid.displayName}</p>
                    <p className="text-sm text-muted-foreground">@{kid.username} • {kid.email || "No email"} • {kid.points} points • {kid.blocked ? "Blocked" : "Active"}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Keys: {kid.keys.length ? kid.keys.map((entry) => `${entry.keyType}(${entry.quantity})`).join(", ") : "none"}
                      {kid.salahEnabled ? ` • Salah ${kid.salahCompletedToday}/${kid.salahGoal}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => onAssignBonus(kid.id, 5)} className="rounded-full">+5 bonus</Button>
                    <Button variant="outline" onClick={() => onAssignBonus(kid.id, 15)} className="rounded-full">+15 bonus</Button>
                    <Button variant="outline" onClick={() => onGrantKey(kid.id, "parent-approval", 1)} className="rounded-full">Gift parent key</Button>
                    <Button variant="outline" onClick={() => onGrantKey(kid.id, "double-parent", 2)} className="rounded-full">Gift 2-parent key</Button>
                    <Button variant="outline" onClick={() => onResetPassword(kid.id)} className="rounded-full">Send reset email</Button>
                    <Button variant="outline" onClick={() => onResetCompletedTasks(kid.id)} className="rounded-full">Reopen tasks</Button>
                    <Button variant="outline" onClick={() => onStartEditUser(kid.id)} className="rounded-full">Edit user</Button>
                    <Button onClick={() => onToggleBlocked(kid.id)} className="rounded-full">{kid.blocked ? "Unblock" : "Block"}</Button>
                  </div>
                </div>
                {editingUserId === kid.id ? (
                  <div className="mt-4 grid gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/50">
                    <Input value={userEditForm.username} onChange={(event) => setUserEditForm((previous) => ({ ...previous, username: event.target.value }))} placeholder="Username" />
                    <Input value={userEditForm.displayName} onChange={(event) => setUserEditForm((previous) => ({ ...previous, displayName: event.target.value }))} placeholder="Display name" />
                    <Input value={userEditForm.email} onChange={(event) => setUserEditForm((previous) => ({ ...previous, email: event.target.value }))} placeholder="Email" />
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={onSaveUser} className="rounded-full">Save user</Button>
                      <Button variant="outline" onClick={() => onSalahSettings(kid.id, !kid.salahEnabled, kid.salahGoal || 5)} className="rounded-full">
                        {kid.salahEnabled ? "Disable Salah" : "Enable Salah"}
                      </Button>
                      <Button variant="outline" onClick={() => onSalahSettings(kid.id, true, 5)} className="rounded-full">Set Salah goal 5</Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <CardHeader>
            <SectionHeader icon={<ClipboardCheck className="h-5 w-5" />} title="Task manager" description="Create chores, assign them, and control auto-reset behavior." />
          </CardHeader>
          <form onSubmit={onTaskSubmit}>
            <CardContent className="space-y-3">
              <Input placeholder="Task title" value={taskForm.title} onChange={(event) => setTaskForm((previous) => ({ ...previous, title: event.target.value }))} />
              <Textarea placeholder="Task description" value={taskForm.description} onChange={(event) => setTaskForm((previous) => ({ ...previous, description: event.target.value }))} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input type="number" min="1" placeholder="Point value" value={taskForm.pointValue} onChange={(event) => setTaskForm((previous) => ({ ...previous, pointValue: event.target.value }))} />
                <Input type="date" value={taskForm.deadline} onChange={(event) => setTaskForm((previous) => ({ ...previous, deadline: event.target.value }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Key reward type (optional)" value={taskForm.keyRewardType} onChange={(event) => setTaskForm((previous) => ({ ...previous, keyRewardType: event.target.value }))} />
                <Input type="number" min="1" placeholder="Key reward quantity" value={taskForm.keyRewardQuantity} onChange={(event) => setTaskForm((previous) => ({ ...previous, keyRewardQuantity: event.target.value }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={taskForm.assignedTo} onChange={(event) => setTaskForm((previous) => ({ ...previous, assignedTo: event.target.value }))}>
                  <option value="all">Assign to all kids</option>
                  {kids.map((kid) => <option key={kid.id} value={kid.id}>{kid.displayName}</option>)}
                </select>
                <label className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
                  <input type="checkbox" checked={taskForm.autoReset} onChange={(event) => setTaskForm((previous) => ({ ...previous, autoReset: event.target.checked }))} />
                  Auto reset
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button type="submit" className="rounded-full">{editingTaskId ? "Save task" : "Add task"}</Button>
              {editingTaskId ? <Button type="button" variant="outline" className="rounded-full" onClick={() => { setEditingTaskId(null); setTaskForm(emptyTaskForm); }}>Cancel</Button> : null}
            </CardFooter>
          </form>
          <CardContent className="space-y-3">
            {appState.tasks.map((task) => (
              <div key={task.id} className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/75">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-sky-700 dark:text-sky-200">
                      {task.pointValue} pts • {task.assignedTo === "all" ? "All kids" : kids.find((kid) => kid.id === task.assignedTo)?.displayName ?? "Assigned kid"}{task.deadline ? ` • Due ${task.deadline}` : ""}{task.autoReset ? " • Auto resets" : " • One-time until reopened"}{task.keyRewardType ? ` • Gives ${task.keyRewardQuantity} ${task.keyRewardType}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-full" onClick={() => onStartEditTask(task.id)}>Edit</Button>
                    <Button variant="outline" className="rounded-full" onClick={() => onDeleteTask(task.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <CardHeader>
            <SectionHeader icon={<Gift className="h-5 w-5" />} title="Reward manager" description="Build rewards with points, icons, and optional approval keys." />
          </CardHeader>
          <form onSubmit={onRewardSubmit}>
            <CardContent className="space-y-3">
              <Input placeholder="Reward title" value={rewardForm.title} onChange={(event) => setRewardForm((previous) => ({ ...previous, title: event.target.value }))} />
              <Textarea placeholder="Reward description" value={rewardForm.description} onChange={(event) => setRewardForm((previous) => ({ ...previous, description: event.target.value }))} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input type="number" min="1" placeholder="Point cost" value={rewardForm.pointCost} onChange={(event) => setRewardForm((previous) => ({ ...previous, pointCost: event.target.value }))} />
                <Input placeholder="Icon or emoji" value={rewardForm.icon} onChange={(event) => setRewardForm((previous) => ({ ...previous, icon: event.target.value }))} />
              </div>
              <label className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
                <input type="checkbox" checked={rewardForm.approvalKeyRequired} onChange={(event) => setRewardForm((previous) => ({ ...previous, approvalKeyRequired: event.target.checked }))} />
                Approval key required
              </label>
              {rewardForm.approvalKeyRequired ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Required key type" value={rewardForm.requiredKeyType} onChange={(event) => setRewardForm((previous) => ({ ...previous, requiredKeyType: event.target.value }))} />
                  <Input type="number" min="1" placeholder="Required key quantity" value={rewardForm.requiredKeyQuantity} onChange={(event) => setRewardForm((previous) => ({ ...previous, requiredKeyQuantity: event.target.value }))} />
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button type="submit" className="rounded-full">{editingRewardId ? "Save reward" : "Add reward"}</Button>
              {editingRewardId ? <Button type="button" variant="outline" className="rounded-full" onClick={() => { setEditingRewardId(null); setRewardForm(emptyRewardForm); }}>Cancel</Button> : null}
            </CardFooter>
          </form>
          <CardContent className="space-y-3">
            {appState.rewards.map((reward) => (
              <div key={reward.id} className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/75">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold">{reward.icon} {reward.title}</p>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-orange-700 dark:text-orange-200">{reward.pointCost} pts {reward.approvalKeyRequired ? `• Needs ${reward.requiredKeyQuantity} ${reward.requiredKeyType}` : ""}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-full" onClick={() => onStartEditReward(reward.id)}>Edit</Button>
                    <Button variant="outline" className="rounded-full" onClick={() => onDeleteReward(reward.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
        <CardHeader>
          <SectionHeader icon={<Activity className="h-5 w-5" />} title="Activity log" description="Everything the family does in one admin-only audit trail." />
        </CardHeader>
        <CardContent className="space-y-3">
          {appState.activityLogs.slice(0, 18).map((entry) => (
            <div key={entry.id} className="rounded-3xl border border-white/60 bg-white/80 p-4 text-sm dark:border-white/10 dark:bg-slate-900/75">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <p><span className="font-semibold">{entry.actor}</span> {entry.action}</p>
                <p className="text-muted-foreground">{formatDate(entry.timeStamp)}</p>
              </div>
              <p className="mt-1 text-muted-foreground">{entry.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
