import { FormEvent, useEffect, useMemo, useState } from "react";
import { Activity, ClipboardCheck, Gift, Medal, Settings, Star, Trophy, UserRound, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeader, StatCard } from "@/perfo/PerfoBits";
import { formatDate } from "@/perfo/data";
import { FamilyAppState, FamilyUser, TaskItem } from "@/perfo/types";

export function UserDashboardView({
  appState,
  currentUser,
  visibleTasks,
  pointProgress,
  requestNotes,
  setRequestNotes,
  proofPhotos,
  setProofPhotos,
  rewardKeys,
  setRewardKeys,
  onSubmitPointRequest,
  onRedeemReward,
  onUpdateSalahToday,
  onSaveOwnSettings,
  onChangeOwnPassword,
  onDeleteOwnAccount,
}: {
  appState: FamilyAppState;
  currentUser: FamilyUser;
  visibleTasks: TaskItem[];
  pointProgress: number;
  requestNotes: Record<string, string>;
  setRequestNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  proofPhotos: Record<string, string>;
  setProofPhotos: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  rewardKeys: Record<string, string>;
  setRewardKeys: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmitPointRequest: (taskId: string) => void;
  onRedeemReward: (rewardId: string) => void;
  onUpdateSalahToday: (completedCount: number) => void;
  onSaveOwnSettings: (values: { username: string; displayName: string; email: string }) => void;
  onChangeOwnPassword: (values: { password: string; confirmPassword: string }) => void;
  onDeleteOwnAccount: () => void;
}) {
  const [settingsForm, setSettingsForm] = useState({
    username: currentUser.username,
    displayName: currentUser.displayName,
    email: currentUser.email,
  });
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setSettingsForm({
      username: currentUser.username,
      displayName: currentUser.displayName,
      email: currentUser.email,
    });
  }, [currentUser.username, currentUser.displayName, currentUser.email]);

  const history = [
    ...currentUser.earnedHistory.map((item) => ({ ...item, type: "earned" as const })),
    ...currentUser.spentHistory.map((item) => ({ ...item, type: "spent" as const })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const leaderboard = useMemo(
    () =>
      [...appState.users]
        .filter((user) => user.role === "user")
        .sort((a, b) => b.points - a.points || b.earnedHistory.length - a.earnedHistory.length),
    [appState.users],
  );

  const currentRank = Math.max(1, leaderboard.findIndex((user) => user.id === currentUser.id) + 1);

  const handleSaveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSaveOwnSettings(settingsForm);
  };

  const handleSavePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onChangeOwnPassword(passwordForm);
    setPasswordForm({ password: "", confirmPassword: "" });
  };

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid h-auto w-full grid-cols-3 rounded-[1.5rem] bg-white/75 p-2 shadow-lg dark:bg-slate-950/60">
        <TabsTrigger value="overview" className="rounded-xl py-3 text-sm font-semibold">Overview</TabsTrigger>
        <TabsTrigger value="leaderboard" className="rounded-xl py-3 text-sm font-semibold">Leaderboard</TabsTrigger>
        <TabsTrigger value="settings" className="rounded-xl py-3 text-sm font-semibold">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Wallet />} label="Current points" value={currentUser.points} />
          <StatCard icon={<ClipboardCheck />} label="Available tasks" value={visibleTasks.length} />
          <StatCard icon={<Gift />} label="Rewards to unlock" value={appState.rewards.length} />
          <StatCard icon={<Trophy />} label="Leaderboard rank" value={`#${currentRank}`} />
        </div>

        {currentUser.salahEnabled ? (
          <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <CardHeader>
              <SectionHeader icon={<Star className="h-5 w-5" />} title="Salah tracker" description="Track today's prayers if your admin enabled it for you." />
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Today's progress: {currentUser.salahCompletedToday} / {currentUser.salahGoal}</p>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5].map((count) => (
                  <Button key={count} variant={currentUser.salahCompletedToday === count ? "default" : "outline"} className="rounded-full" onClick={() => onUpdateSalahToday(count)}>
                    {count}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <CardHeader>
              <SectionHeader icon={<Star className="h-5 w-5" />} title="Your progress" description="Keep earning and save for bigger rewards." />
            </CardHeader>
            <CardContent>
              <div className="rounded-[2rem] bg-gradient-to-r from-sky-500 via-cyan-400 to-orange-400 p-[1px] shadow-lg">
                <div className="rounded-[calc(2rem-1px)] bg-white/95 p-5 dark:bg-slate-950/90">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Perfo Wallet</p>
                      <p className="text-3xl font-semibold">{currentUser.points} pts</p>
                    </div>
                    <div className="rounded-3xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                      {currentUser.avatar}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                      <span>Reward saving progress</span>
                      <span>{pointProgress}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-orange-400 transition-all" style={{ width: `${pointProgress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <CardHeader>
              <SectionHeader icon={<Activity className="h-5 w-5" />} title="Latest history" description="See what you earned and what you spent." />
            </CardHeader>
            <CardContent className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="rounded-3xl border border-white/60 bg-white/80 p-4 text-sm dark:border-white/10 dark:bg-slate-900/75">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{item.type === "earned" ? item.task : item.reward}</p>
                    <p className={item.type === "earned" ? "text-emerald-600 dark:text-emerald-300" : "text-orange-600 dark:text-orange-300"}>
                      {item.type === "earned" ? `+${item.points}` : `-${item.cost}`} pts
                    </p>
                  </div>
                  <p className="mt-1 text-muted-foreground">{formatDate(item.date)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <CardHeader>
              <SectionHeader icon={<ClipboardCheck className="h-5 w-5" />} title="Available tasks" description="Complete a task, then send a request for approval." />
            </CardHeader>
            <CardContent className="space-y-4">
              {visibleTasks.map((task) => {
                const pending = appState.pointRequests.some(
                  (request) => request.taskId === task.id && request.userId === currentUser.id && request.status === "pending",
                );

                return (
                  <div key={task.id} className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/75">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="max-w-xl">
                        <p className="text-lg font-semibold">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-sky-700 dark:text-sky-200">
                          {task.pointValue} pts {task.deadline ? `• Due ${task.deadline}` : ""} {task.autoReset ? "• Repeatable" : "• One-time"} {task.keyRewardType ? `• Gives ${task.keyRewardQuantity} ${task.keyRewardType}` : ""}
                        </p>
                        <label className="mt-3 block text-sm font-medium">Photo proof</label>
                        <Input
                          className="mt-2"
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === "string") {
                                setProofPhotos((previous) => ({ ...previous, [task.id]: reader.result }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        {proofPhotos[task.id] ? (
                          <img
                            src={proofPhotos[task.id]}
                            alt={`${task.title} proof`}
                            className="mt-3 h-36 w-full rounded-2xl object-cover"
                          />
                        ) : null}
                        <Textarea className="mt-3" placeholder="Optional note for the parent" value={requestNotes[task.id] ?? ""} onChange={(event) => setRequestNotes((previous) => ({ ...previous, [task.id]: event.target.value }))} />
                      </div>
                      <Button onClick={() => onSubmitPointRequest(task.id)} disabled={pending} className="rounded-full">
                        {pending ? "Pending review" : "Request points"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <CardHeader>
              <SectionHeader icon={<Gift className="h-5 w-5" />} title="Reward shop" description="Redeem rewards when your wallet is ready." />
            </CardHeader>
            <CardContent className="space-y-4">
              {appState.rewards.map((reward) => (
                <div key={reward.id} className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/75">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-xl">
                      <p className="text-lg font-semibold">{reward.icon} {reward.title}</p>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-orange-700 dark:text-orange-200">
                        {reward.pointCost} pts {reward.approvalKeyRequired ? `• Needs ${reward.requiredKeyQuantity} ${reward.requiredKeyType}` : ""}
                      </p>
                      {reward.approvalKeyRequired ? <p className="mt-3 text-sm text-muted-foreground">You have {currentUser.keys.find((entry) => entry.keyType === reward.requiredKeyType)?.quantity || 0} {reward.requiredKeyType} key(s).</p> : null}
                    </div>
                    <Button onClick={() => onRedeemReward(reward.id)} disabled={currentUser.points < reward.pointCost} className="rounded-full">
                      Redeem reward
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="leaderboard" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={<Trophy />} label="Your rank" value={`#${currentRank}`} />
          <StatCard icon={<Wallet />} label="Your points" value={currentUser.points} />
          <StatCard icon={<Medal />} label="Players" value={leaderboard.length} />
        </div>

        <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <CardHeader>
            <SectionHeader icon={<Trophy className="h-5 w-5" />} title="Family leaderboard" description="See who is leading the family right now." />
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboard.map((user, index) => (
              <div key={user.id} className={`rounded-3xl border p-4 shadow-sm ${user.id === currentUser.id ? "border-sky-300/80 bg-sky-50/90 dark:border-sky-900 dark:bg-sky-950/35" : "border-white/60 bg-white/80 dark:border-white/10 dark:bg-slate-900/75"}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{user.displayName}{user.id === currentUser.id ? " (You)" : ""}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{user.points} pts</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{user.earnedHistory.length} wins</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <CardHeader>
              <SectionHeader icon={<Settings className="h-5 w-5" />} title="Profile settings" description="Update your username, display name, and email." />
            </CardHeader>
            <form onSubmit={handleSaveSettings}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-username">Change username</Label>
                  <p className="text-sm text-muted-foreground">This is the short name your family sees with an @ sign on the leaderboard.</p>
                  <Input
                    id="settings-username"
                    value={settingsForm.username}
                    onChange={(event) => setSettingsForm((previous) => ({ ...previous, username: event.target.value }))}
                    placeholder="Choose your username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-display-name">Change display name</Label>
                  <p className="text-sm text-muted-foreground">This is the full name shown around the app and in family activity.</p>
                  <Input
                    id="settings-display-name"
                    value={settingsForm.displayName}
                    onChange={(event) => setSettingsForm((previous) => ({ ...previous, displayName: event.target.value }))}
                    placeholder="Choose your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-email">Change email address</Label>
                  <p className="text-sm text-muted-foreground">This email is used for sign in, password resets, and confirmation links.</p>
                  <Input
                    id="settings-email"
                    type="email"
                    value={settingsForm.email}
                    onChange={(event) => setSettingsForm((previous) => ({ ...previous, email: event.target.value }))}
                    placeholder="Enter your email address"
                  />
                </div>
                <p className="text-sm text-muted-foreground">If you change your email, Perfo Points will ask you to confirm the new one first.</p>
                <Button type="submit" className="w-full rounded-full">Save profile changes</Button>
              </CardContent>
            </form>
          </Card>

          <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <CardHeader>
              <SectionHeader icon={<UserRound className="h-5 w-5" />} title="Password" description="Choose a new password for your account." />
            </CardHeader>
            <form onSubmit={handleSavePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-password">New password</Label>
                  <p className="text-sm text-muted-foreground">Pick a new password for signing in on phones, tablets, and desktop.</p>
                  <Input
                    id="settings-password"
                    type="password"
                    value={passwordForm.password}
                    onChange={(event) => setPasswordForm((previous) => ({ ...previous, password: event.target.value }))}
                    placeholder="Enter a new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-password-confirm">Confirm new password</Label>
                  <p className="text-sm text-muted-foreground">Type the same new password again so Perfo Points knows it was entered correctly.</p>
                  <Input
                    id="settings-password-confirm"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((previous) => ({ ...previous, confirmPassword: event.target.value }))}
                    placeholder="Re-enter your new password"
                  />
                </div>
                <Button type="submit" className="w-full rounded-full">Save new password</Button>
              </CardContent>
            </form>
          </Card>
        </div>

        <Card className="border-red-300/70 bg-red-50/90 shadow-xl backdrop-blur dark:border-red-900/70 dark:bg-red-950/30">
          <CardHeader>
            <SectionHeader
              icon={<UserRound className="h-5 w-5" />}
              title="Delete account"
              description="Permanently remove this Perfo Points profile, along with your points, requests, and history from the family app."
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This signs you out right away. If you ever want back in later, a parent or admin will need to create your family profile again.
            </p>
            <Button type="button" variant="destructive" className="w-full rounded-full" onClick={onDeleteOwnAccount}>
              Delete my account
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
