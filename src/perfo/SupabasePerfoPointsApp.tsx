import { FormEvent, useEffect, useMemo, useState } from "react";
import { LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeSwitch } from "@/perfo/PerfoBits";
import { AdminView } from "@/perfo/AdminView";
import { LoginView } from "@/perfo/LoginView";
import { UserDashboardView } from "@/perfo/UserDashboardView";
import { emptyRewardForm, emptyTaskForm, emptyUserForm, formatDate, isSameDay } from "@/perfo/data";
import { FamilyAppState, FamilyUser, RewardItem, TaskItem, UserEditFormState } from "@/perfo/types";

const INITIAL_STATE: FamilyAppState = {
  users: [],
  tasks: [],
  rewards: [],
  pointRequests: [],
  activityLogs: [],
  dailyRedemptionLimit: 2,
};

function mapProfile(
  profile: any,
  earnedHistory: FamilyUser["earnedHistory"],
  spentHistory: FamilyUser["spentHistory"],
): FamilyUser {
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.full_name || profile.username,
    email: profile.email || "",
    role: profile.role === "admin" ? "admin" : "user",
    points: profile.points || 0,
    blocked: Boolean(profile.is_blocked),
    avatar: profile.avatar_url || profile.username?.[0]?.toUpperCase() || "P",
    earnedHistory,
    spentHistory,
  };
}

export function SupabasePerfoPointsApp() {
  const [appState, setAppState] = useState<FamilyAppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [loadScreenTimedOut, setLoadScreenTimedOut] = useState(false);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginForm, setLoginForm] = useState({ emailOrUsername: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", username: "", displayName: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [rewardForm, setRewardForm] = useState(emptyRewardForm);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userEditForm, setUserEditForm] = useState<UserEditFormState>({ username: "", displayName: "", email: "" });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [rewardKeys, setRewardKeys] = useState<Record<string, string>>({});
  const [requestNotes, setRequestNotes] = useState<Record<string, string>>({});
  const [proofPhotos, setProofPhotos] = useState<Record<string, string>>({});
  const [resetPasswordForm, setResetPasswordForm] = useState({ password: "", confirmPassword: "" });

  const searchParams = new URLSearchParams(window.location.search);
  const isRecoveryMode = searchParams.get("type") === "recovery" && Boolean(searchParams.get("access_token"));

  const currentUser = appState.users.find((user) => user.id === sessionUserId) ?? null;
  const kids = useMemo(() => appState.users.filter((user) => user.role === "user"), [appState.users]);
  const pendingRequests = useMemo(() => appState.pointRequests.filter((request) => request.status === "pending"), [appState.pointRequests]);
  const visibleTasks = currentUser?.role === "user"
    ? appState.tasks.filter((task) => {
        if (task.autoReset) return true;
        return !appState.pointRequests.some(
          (request) =>
            request.userId === currentUser.id &&
            request.taskId === task.id &&
            request.status === "approved",
        );
      })
    : appState.tasks;
  const totalAvailablePoints = visibleTasks.reduce((sum, task) => sum + task.pointValue, 0);
  const pointProgress = currentUser?.role === "user" && totalAvailablePoints > 0
    ? Math.min(100, Math.round((currentUser.points / totalAvailablePoints) * 100))
    : 0;
  const effectiveBackendMessage = backendMessage || (loadScreenTimedOut
    ? "Still connecting to Supabase. You can keep using the sign-in screen, but if this keeps happening, run `supabase db push` and refresh."
    : null);
  const shouldShowAuthScreen = !currentUser && (!loading || loadScreenTimedOut || Boolean(effectiveBackendMessage) || Boolean(pendingVerificationEmail));

  const getFriendlyErrorMessage = (error: any, fallback: string) => {
    const message = error?.message || fallback;
    if (message.includes("Could not find the table 'public.profiles'")) {
      return "Perfo Points is connected to Supabase, but the family tables are not set up yet. Run `supabase db push`, then refresh the app.";
    }
    if (message.toLowerCase().includes("email rate limit exceeded")) {
      return "Too many email messages were requested too quickly. Wait a minute, then try again.";
    }
    if (message.toLowerCase().includes("email not confirmed")) {
      return "Confirm your email first, then sign in.";
    }
    if (message.toLowerCase().includes("invalid login credentials")) {
      return "That email or password did not match. Try again.";
    }
    return message;
  };

  const handleAppError = (error: any, fallback: string) => {
    const friendlyMessage = getFriendlyErrorMessage(error, fallback);
    if (friendlyMessage.includes("family tables are not set up yet")) {
      setBackendMessage(friendlyMessage);
      setAppState(INITIAL_STATE);
    }
    toast.error(friendlyMessage);
    return friendlyMessage;
  };

  const ensureProfile = async (user: { id: string; email?: string }, username?: string, displayName?: string) => {
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (profileError) throw profileError;
    if (profile) {
      const updates: Record<string, string> = {};
      if (user.email && profile.email !== user.email) updates.email = user.email;
      if (username && profile.username !== username) updates.username = username;
      if (displayName && profile.full_name !== displayName) updates.full_name = displayName;
      if (Object.keys(updates).length > 0) {
        const { data: updated, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single();
        if (error) throw error;
        return updated;
      }
      return profile;
    }

    const payload = {
      id: user.id,
      email: user.email || "",
      username: username || user.email?.split("@")[0] || `user_${user.id.slice(0, 6)}`,
      full_name: displayName || username || user.email?.split("@")[0] || "Family User",
      role: "user",
      points: 0,
      email_verified: false,
      avatar_url: (displayName || username || "P").slice(0, 1).toUpperCase(),
    };

    const { data: inserted, error } = await supabase.from("profiles").insert(payload).select().single();
    if (error) throw error;
    return inserted;
  };

  const fetchAppData = async (activeUserId?: string | null) => {
    setLoading(true);
    try {
      const sessionResult = await supabase.auth.getSession();
      const session = sessionResult.data.session;
      const userId = activeUserId ?? session?.user?.id ?? null;
      setSessionUserId(userId);
      setBackendMessage(null);

      if (!userId) {
        setAppState(INITIAL_STATE);
        return;
      }

      const [
        profilesResult,
        tasksResult,
        rewardsResult,
        requestsResult,
        historyResult,
        userKeysResult,
        taskKeysResult,
        rewardKeysResult,
        salahSettingsResult,
        salahLogsResult,
      ] = await Promise.all([
        supabase.from("profiles").select("*").order("username"),
        supabase.from("tasks").select("*").order("created_at", { ascending: false }),
        supabase.from("rewards").select("*").order("title"),
        supabase.from("point_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("points_history").select("*").order("timestamp", { ascending: false }),
        supabase.from("user_keys").select("*"),
        supabase.from("task_key_rewards").select("*"),
        supabase.from("reward_key_requirements").select("*"),
        supabase.from("user_salah_settings").select("*"),
        supabase.from("salah_logs").select("*").eq("log_date", new Date().toISOString().slice(0, 10)),
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (tasksResult.error) throw tasksResult.error;
      if (rewardsResult.error) throw rewardsResult.error;
      if (requestsResult.error) throw requestsResult.error;
      if (historyResult.error) throw historyResult.error;
      if (userKeysResult.error) throw userKeysResult.error;
      if (taskKeysResult.error) throw taskKeysResult.error;
      if (rewardKeysResult.error) throw rewardKeysResult.error;
      if (salahSettingsResult.error) throw salahSettingsResult.error;
      if (salahLogsResult.error) throw salahLogsResult.error;

      const historyByUser = new Map<string, { earned: FamilyUser["earnedHistory"]; spent: FamilyUser["spentHistory"] }>();
      for (const item of historyResult.data ?? []) {
        const bucket = historyByUser.get(item.user_id) ?? { earned: [], spent: [] };
        if (item.points >= 0) {
          bucket.earned.push({
            id: item.id,
            taskId: item.task_id || "manual",
            task: item.task_title || item.reason || "Points earned",
            points: item.points,
            date: item.timestamp,
          });
        } else {
          bucket.spent.push({
            id: item.id,
            rewardId: item.task_id || "reward",
            reward: item.reason || "Reward redeemed",
            cost: Math.abs(item.points),
            date: item.timestamp,
          });
        }
        historyByUser.set(item.user_id, bucket);
      }

      const userKeysMap = new Map<string, FamilyUser["keys"]>();
      for (const key of userKeysResult.data ?? []) {
        const entries = userKeysMap.get(key.user_id) ?? [];
        entries.push({ keyType: key.key_type, quantity: key.quantity });
        userKeysMap.set(key.user_id, entries);
      }

      const salahSettingsMap = new Map((salahSettingsResult.data ?? []).map((entry) => [entry.user_id, entry]));
      const salahLogsMap = new Map((salahLogsResult.data ?? []).map((entry) => [entry.user_id, entry]));

      const users = (profilesResult.data ?? []).map((profile) => {
        const history = historyByUser.get(profile.id) ?? { earned: [], spent: [] };
        const salahSetting = salahSettingsMap.get(profile.id);
        const salahLog = salahLogsMap.get(profile.id);
        return {
          ...mapProfile(profile, history.earned, history.spent),
          keys: userKeysMap.get(profile.id) ?? [],
          salahEnabled: Boolean(salahSetting?.enabled),
          salahGoal: salahSetting?.daily_goal ?? 5,
          salahCompletedToday: salahLog?.completed_count ?? 0,
        };
      });

      const taskKeyMap = new Map((taskKeysResult.data ?? []).map((entry) => [entry.task_id, entry]));
      const tasks: TaskItem[] = (tasksResult.data ?? []).map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        pointValue: task.points_value || 0,
        deadline: "",
        autoReset: Boolean(task.recurring),
        assignedTo: "all",
        keyRewardType: taskKeyMap.get(task.id)?.key_type || "",
        keyRewardQuantity: taskKeyMap.get(task.id)?.quantity || 0,
      }));

      const rewardKeyMap = new Map((rewardKeysResult.data ?? []).map((entry) => [entry.reward_id, entry]));
      const rewards: RewardItem[] = (rewardsResult.data ?? []).map((reward) => ({
        id: reward.id,
        title: reward.title,
        description: reward.description || "",
        pointCost: reward.points_cost,
        icon: reward.category === "screen-time" ? "📱" : reward.category === "treat" ? "🍪" : "🎁",
        approvalKeyRequired: Boolean(reward.requires_approval),
        requiredKeyType: rewardKeyMap.get(reward.id)?.key_type || "",
        requiredKeyQuantity: rewardKeyMap.get(reward.id)?.quantity || 0,
      }));

      const pointRequests = (requestsResult.data ?? []).map((request) => ({
        id: request.id,
        userId: request.user_id,
        taskId: request.task_id,
        status: request.status === "rejected" ? "denied" as const : request.status as "pending" | "approved",
        timeStamp: request.created_at,
        note: request.comment || "",
        photoUrl: request.photo_url || "",
      }));

      const taskMap = new Map(tasks.map((task) => [task.id, task.title]));
      const userMap = new Map(users.map((user) => [user.id, user.displayName]));
      const activityLogs = pointRequests.slice(0, 30).map((request) => ({
        id: `request_${request.id}`,
        userId: request.userId,
        actor: userMap.get(request.userId) || "Family member",
        action: request.status === "pending" ? "submitted task proof" : request.status === "approved" ? "had a task approved" : "had a task denied",
        detail: `${taskMap.get(request.taskId) || "Task"} on ${formatDate(request.timeStamp)}`,
        timeStamp: request.timeStamp,
      }));

      setAppState({
        users,
        tasks,
        rewards,
        pointRequests,
        activityLogs,
        dailyRedemptionLimit: 2,
      });
    } catch (error: any) {
      console.error(error);
      handleAppError(error, "Failed to load Supabase data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppData();
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          await ensureProfile(session.user);
        }
      } catch (error: any) {
        console.error(error);
        handleAppError(error, "Could not load your family profile.");
      }
      fetchAppData(session?.user?.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      setLoadScreenTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLoadScreenTimedOut(true);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [loading]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setBackendMessage(null);
      let email = loginForm.emailOrUsername.trim();
      if (!email.includes("@")) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", email.toLowerCase())
          .maybeSingle();
        if (error) throw error;
        if (!profile?.email) throw new Error("Username not found.");
        email = profile.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password: loginForm.password });
      if (error) throw error;
      if (data.user) await ensureProfile(data.user);
      setAdminPassword(loginForm.password);
      setLoginForm({ emailOrUsername: "", password: "" });
      setPendingVerificationEmail("");
      await fetchAppData(data.user?.id ?? null);
      toast.success("Signed in.");
    } catch (error: any) {
      handleAppError(error, "Login failed.");
    }
  };

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setBackendMessage(null);
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email.trim(),
        password: signupForm.password,
        options: {
          data: {
            username: signupForm.username.trim().toLowerCase(),
            fullName: signupForm.displayName.trim(),
          },
        },
      });
      if (error) throw error;

      const email = signupForm.email.trim();
      const username = signupForm.username.trim().toLowerCase();
      const displayName = signupForm.displayName.trim();
      const hasSession = Boolean(data.session);

      if (data.user && hasSession) {
        await ensureProfile(data.user, signupForm.username.trim().toLowerCase(), signupForm.displayName.trim());
      }
      setSignupForm({ email: "", username: "", displayName: "", password: "" });

      if (hasSession) {
        if (data.user) {
          setAdminPassword(signupForm.password);
          await fetchAppData(data.user.id);
        }
        setPendingVerificationEmail("");
        toast.success("Account created and signed in.");
        return;
      }

      setPendingVerificationEmail(email);
      toast.success(`Account created. Confirm ${email} from your email, then sign in.`);
      if (data.user) {
        try {
          await ensureProfile(data.user, username, displayName);
        } catch (error: any) {
          console.error(error);
        }
      }
    } catch (error: any) {
      handleAppError(error, "Signup failed.");
    }
  };

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail.trim()) {
      toast.error("Enter your email again or create the account first.");
      return;
    }
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingVerificationEmail.trim(),
      });
      if (error) throw error;
      toast.success(`Confirmation email sent again to ${pendingVerificationEmail}.`);
    } catch (error: any) {
      handleAppError(error, "Could not resend the confirmation email.");
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      toast.error("Enter an email first.");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}`,
      });
      if (error) throw error;
      toast.success("Password reset email sent.");
      setResetEmail("");
    } catch (error: any) {
      handleAppError(error, "Could not send reset email.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAdminPassword("");
    toast.success("Signed out.");
  };

  const handleTaskSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const payload = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        points_value: Number(taskForm.pointValue),
        recurring: taskForm.autoReset,
        status: "active",
        created_by: currentUser.id,
      };
      let taskId = editingTaskId;
      if (editingTaskId) {
        const { error } = await supabase.from("tasks").update(payload).eq("id", editingTaskId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("tasks").insert(payload).select().single();
        if (error) throw error;
        taskId = data.id;
      }
      if (taskId) {
        await supabase.from("task_key_rewards").delete().eq("task_id", taskId);
        if (taskForm.keyRewardType.trim()) {
          const { error: keyError } = await supabase.from("task_key_rewards").insert({
            task_id: taskId,
            key_type: taskForm.keyRewardType.trim(),
            quantity: Math.max(1, Number(taskForm.keyRewardQuantity) || 1),
          });
          if (keyError) throw keyError;
        }
      }
      setTaskForm(emptyTaskForm);
      setEditingTaskId(null);
      await fetchAppData(currentUser.id);
      toast.success(editingTaskId ? "Task updated." : "Task created.");
    } catch (error: any) {
      toast.error(error.message || "Could not save task.");
    }
  };

  const handleRewardSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const payload = {
        title: rewardForm.title.trim(),
        description: rewardForm.description.trim(),
        points_cost: Number(rewardForm.pointCost),
        requires_approval: rewardForm.approvalKeyRequired,
        category: rewardForm.icon.trim() || "general",
      };
      let rewardId = editingRewardId;
      if (editingRewardId) {
        const { error } = await supabase.from("rewards").update(payload).eq("id", editingRewardId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("rewards").insert(payload).select().single();
        if (error) throw error;
        rewardId = data.id;
      }
      if (rewardId) {
        await supabase.from("reward_key_requirements").delete().eq("reward_id", rewardId);
        if (rewardForm.approvalKeyRequired && rewardForm.requiredKeyType.trim()) {
          const { error: keyError } = await supabase.from("reward_key_requirements").insert({
            reward_id: rewardId,
            key_type: rewardForm.requiredKeyType.trim(),
            quantity: Math.max(1, Number(rewardForm.requiredKeyQuantity) || 1),
          });
          if (keyError) throw keyError;
        }
      }
      setRewardForm(emptyRewardForm);
      setEditingRewardId(null);
      await fetchAppData(currentUser.id);
      toast.success(editingRewardId ? "Reward updated." : "Reward created.");
    } catch (error: any) {
      toast.error(error.message || "Could not save reward.");
    }
  };

  const handleUserSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const adminEmail = currentUser.email;
      const { data, error } = await supabase.auth.signUp({
        email: userForm.email.trim(),
        password: userForm.password,
        options: {
          data: {
            username: userForm.username.trim().toLowerCase(),
            fullName: userForm.displayName.trim(),
          },
        },
      });
      if (error) throw error;
      if (data.user) {
        await ensureProfile(data.user, userForm.username.trim().toLowerCase(), userForm.displayName.trim());
      }

      if (adminEmail && adminPassword) {
        await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
      }
      setUserForm(emptyUserForm);
      await fetchAppData(currentUser.id);
      toast.success("User account created.");
    } catch (error: any) {
      toast.error(error.message || "Could not add user.");
    }
  };

  const handleReviewRequest = async (requestId: string, status: "approved" | "denied") => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const request = appState.pointRequests.find((entry) => entry.id === requestId);
      const task = appState.tasks.find((entry) => entry.id === request?.taskId);
      const kid = appState.users.find((entry) => entry.id === request?.userId);
      if (!request || !task || !kid) return;

      const dbStatus = status === "denied" ? "rejected" : "approved";
      const { error } = await supabase.from("point_requests").update({ status: dbStatus, reviewed_by: currentUser.id }).eq("id", requestId);
      if (error) throw error;

      if (status === "approved") {
        const newTotal = kid.points + task.pointValue;
        const { error: profileError } = await supabase.from("profiles").update({ points: newTotal }).eq("id", kid.id);
        if (profileError) throw profileError;
        const { error: historyError } = await supabase.from("points_history").insert({
          user_id: kid.id,
          points: task.pointValue,
          new_total: newTotal,
          task_id: task.id,
          task_title: task.title,
          type: "task_completion",
          reason: `Approved task: ${task.title}`,
        });
        if (historyError) throw historyError;

        if (task.keyRewardType) {
          const currentKey = kid.keys.find((entry) => entry.keyType === task.keyRewardType)?.quantity || 0;
          const newKeyTotal = currentKey + task.keyRewardQuantity;
          const { data: existingKey } = await supabase
            .from("user_keys")
            .select("*")
            .eq("user_id", kid.id)
            .eq("key_type", task.keyRewardType)
            .maybeSingle();

          if (existingKey) {
            const { error: updateKeyError } = await supabase
              .from("user_keys")
              .update({ quantity: newKeyTotal })
              .eq("id", existingKey.id);
            if (updateKeyError) throw updateKeyError;
          } else {
            const { error: insertKeyError } = await supabase.from("user_keys").insert({
              user_id: kid.id,
              key_type: task.keyRewardType,
              quantity: task.keyRewardQuantity,
            });
            if (insertKeyError) throw insertKeyError;
          }

          await supabase.from("keys_history").insert({
            user_id: kid.id,
            key_type: task.keyRewardType,
            quantity: task.keyRewardQuantity,
            new_total: newKeyTotal,
            type: "task_reward",
            reason: `Earned key from task: ${task.title}`,
          });
        }
      }

      await fetchAppData(currentUser.id);
      toast.success(status === "approved" ? "Request approved." : "Request denied.");
    } catch (error: any) {
      toast.error(error.message || "Could not review request.");
    }
  };

  const uploadProofPhoto = async (taskId: string) => {
    const dataUrl = proofPhotos[taskId];
    if (!dataUrl || !currentUser) return "";
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const filePath = `${currentUser.id}/${taskId}-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("task-proofs").upload(filePath, blob, {
      contentType: blob.type || "image/jpeg",
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("task-proofs").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmitPointRequest = async (taskId: string) => {
    if (!currentUser || currentUser.role !== "user") return;
    try {
      const photoUrl = await uploadProofPhoto(taskId);
      const { error } = await supabase.from("point_requests").insert({
        user_id: currentUser.id,
        task_id: taskId,
        status: "pending",
        comment: requestNotes[taskId] || null,
        photo_url: photoUrl || null,
      });
      if (error) throw error;
      setRequestNotes((previous) => ({ ...previous, [taskId]: "" }));
      setProofPhotos((previous) => ({ ...previous, [taskId]: "" }));
      await fetchAppData(currentUser.id);
      toast.success("Point request sent.");
    } catch (error: any) {
      toast.error(error.message || "Could not submit request. Make sure the task-proofs bucket exists.");
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    if (!currentUser || currentUser.role !== "user") return;
    try {
      const reward = appState.rewards.find((entry) => entry.id === rewardId);
      if (!reward) return;
      if (currentUser.points < reward.pointCost) throw new Error("Not enough points.");
      if (currentUser.spentHistory.filter((entry) => isSameDay(entry.date, new Date().toISOString())).length >= appState.dailyRedemptionLimit) {
        throw new Error(`Daily reward limit reached. Limit: ${appState.dailyRedemptionLimit}.`);
      }
      if (reward.approvalKeyRequired) {
        const currentKey = currentUser.keys.find((entry) => entry.keyType === reward.requiredKeyType)?.quantity || 0;
        if (!reward.requiredKeyType || currentKey < reward.requiredKeyQuantity) {
          throw new Error(`You need ${reward.requiredKeyQuantity} ${reward.requiredKeyType || "approval"} key(s) for this reward.`);
        }
        const { data: existingKey, error: keyFetchError } = await supabase
          .from("user_keys")
          .select("*")
          .eq("user_id", currentUser.id)
          .eq("key_type", reward.requiredKeyType)
          .maybeSingle();
        if (keyFetchError) throw keyFetchError;
        if (!existingKey) throw new Error("Required key not found.");
        const newKeyTotal = Math.max(0, existingKey.quantity - reward.requiredKeyQuantity);
        const { error: keyUpdateError } = await supabase
          .from("user_keys")
          .update({ quantity: newKeyTotal })
          .eq("id", existingKey.id);
        if (keyUpdateError) throw keyUpdateError;
        await supabase.from("keys_history").insert({
          user_id: currentUser.id,
          key_type: reward.requiredKeyType,
          quantity: -reward.requiredKeyQuantity,
          new_total: newKeyTotal,
          type: "reward_use",
          reason: `Used keys for reward: ${reward.title}`,
        });
      }
      const newTotal = currentUser.points - reward.pointCost;
      const { error: profileError } = await supabase.from("profiles").update({ points: newTotal }).eq("id", currentUser.id);
      if (profileError) throw profileError;
      const { error: historyError } = await supabase.from("points_history").insert({
        user_id: currentUser.id,
        points: -reward.pointCost,
        new_total: newTotal,
        type: "reward_redemption",
        reason: `Redeemed reward: ${reward.title}`,
      });
      if (historyError) throw historyError;
      await fetchAppData(currentUser.id);
      toast.success(`Redeemed ${reward.title}.`);
    } catch (error: any) {
      toast.error(error.message || "Could not redeem reward.");
    }
  };

  const handleAssignBonus = async (userId: string, amount: number) => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const kid = appState.users.find((entry) => entry.id === userId);
      if (!kid) return;
      const newTotal = kid.points + amount;
      await supabase.from("profiles").update({ points: newTotal }).eq("id", userId);
      await supabase.from("points_history").insert({
        user_id: userId,
        points: amount,
        new_total: newTotal,
        type: "admin_grant",
        reason: `Bonus points from ${currentUser.displayName}`,
      });
      await fetchAppData(currentUser.id);
      toast.success(`Added ${amount} bonus points.`);
    } catch (error: any) {
      toast.error(error.message || "Could not assign bonus.");
    }
  };

  const handleGrantKey = async (userId: string, keyType: string, quantity: number) => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const kid = appState.users.find((entry) => entry.id === userId);
      if (!kid) return;
      const currentQuantity = kid.keys.find((entry) => entry.keyType === keyType)?.quantity || 0;
      const newTotal = currentQuantity + quantity;
      const { data: existingKey } = await supabase
        .from("user_keys")
        .select("*")
        .eq("user_id", userId)
        .eq("key_type", keyType)
        .maybeSingle();
      if (existingKey) {
        await supabase.from("user_keys").update({ quantity: newTotal }).eq("id", existingKey.id);
      } else {
        await supabase.from("user_keys").insert({ user_id: userId, key_type: keyType, quantity });
      }
      await supabase.from("keys_history").insert({
        user_id: userId,
        key_type: keyType,
        quantity,
        new_total: newTotal,
        type: "admin_grant",
        reason: `Gifted by ${currentUser.displayName}`,
      });
      await fetchAppData(currentUser.id);
      toast.success(`Granted ${quantity} ${keyType} key(s).`);
    } catch (error: any) {
      toast.error(error.message || "Could not grant key.");
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!currentUser || currentUser.role !== "admin") return;
    const kid = appState.users.find((entry) => entry.id === userId);
    if (!kid?.email) return toast.error("This user does not have an email on file.");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(kid.email, {
        redirectTo: `${window.location.origin}`,
      });
      if (error) throw error;
      toast.success(`Reset email sent to ${kid.email}.`);
    } catch (error: any) {
      toast.error(error.message || "Could not send reset email.");
    }
  };

  const handleToggleBlocked = async (userId: string) => {
    if (!currentUser || currentUser.role !== "admin") return;
    const kid = appState.users.find((entry) => entry.id === userId);
    if (!kid) return;
    try {
      const { error } = await supabase.from("profiles").update({ is_blocked: !kid.blocked }).eq("id", userId);
      if (error) throw error;
      await fetchAppData(currentUser.id);
    } catch (error: any) {
      toast.error(error.message || "Could not update block status.");
    }
  };

  const handleResetCompletedTasks = async (userId: string) => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const completedTaskIds = appState.tasks.filter((task) => !task.autoReset).map((task) => task.id);
      if (completedTaskIds.length === 0) return;
      const { error } = await supabase
        .from("point_requests")
        .delete()
        .eq("user_id", userId)
        .in("task_id", completedTaskIds)
        .eq("status", "approved");
      if (error) throw error;
      await fetchAppData(currentUser.id);
      toast.success("Completed one-time tasks were reopened for that user.");
    } catch (error: any) {
      toast.error(error.message || "Could not reset completed tasks.");
    }
  };

  const startEditUser = (userId: string) => {
    const user = appState.users.find((entry) => entry.id === userId);
    if (!user) return;
    setEditingUserId(userId);
    setUserEditForm({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
    });
  };

  const handleSaveUser = async () => {
    if (!editingUserId) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: userEditForm.username.trim().toLowerCase(),
          full_name: userEditForm.displayName.trim(),
          email: userEditForm.email.trim(),
        })
        .eq("id", editingUserId);
      if (error) throw error;
      setEditingUserId(null);
      await fetchAppData(currentUser?.id);
      toast.success("User profile updated.");
    } catch (error: any) {
      toast.error(error.message || "Could not update user.");
    }
  };

  const handleSalahSettings = async (userId: string, enabled: boolean, dailyGoal: number) => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const { error } = await supabase.from("user_salah_settings").upsert({
        user_id: userId,
        enabled,
        daily_goal: dailyGoal,
      });
      if (error) throw error;
      await fetchAppData(currentUser.id);
      toast.success("Salah settings updated.");
    } catch (error: any) {
      toast.error(error.message || "Could not update salah settings.");
    }
  };

  const handleUpdateSalahToday = async (completedCount: number) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase.from("salah_logs").upsert({
        user_id: currentUser.id,
        log_date: new Date().toISOString().slice(0, 10),
        completed_count: completedCount,
      });
      if (error) throw error;
      await fetchAppData(currentUser.id);
      toast.success("Salah tracker updated.");
    } catch (error: any) {
      toast.error(error.message || "Could not update salah tracker.");
    }
  };

  const handleSaveOwnSettings = async ({ username, displayName, email }: { username: string; displayName: string; email: string }) => {
    if (!currentUser) return;

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedDisplayName = displayName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedUsername || !trimmedDisplayName || !trimmedEmail) {
      toast.error("Username, display name, and email are all required.");
      return;
    }

    try {
      const emailChanged = trimmedEmail !== currentUser.email.toLowerCase();

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: trimmedUsername,
          full_name: trimmedDisplayName,
          ...(emailChanged ? {} : { email: trimmedEmail }),
        })
        .eq("id", currentUser.id);
      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        ...(emailChanged ? { email: trimmedEmail } : {}),
        data: {
          username: trimmedUsername,
          fullName: trimmedDisplayName,
        },
      });
      if (authError) throw authError;

      await fetchAppData(currentUser.id);
      toast.success(emailChanged ? `Profile updated. Confirm ${trimmedEmail} from your email to finish the change.` : "Profile updated.");
    } catch (error: any) {
      toast.error(getFriendlyErrorMessage(error, "Could not update your settings."));
    }
  };

  const handleChangeOwnPassword = async ({ password, confirmPassword }: { password: string; confirmPassword: string }) => {
    if (!currentUser) return;
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated.");
    } catch (error: any) {
      toast.error(getFriendlyErrorMessage(error, "Could not update your password."));
    }
  };

  const loadTaskForEdit = (taskId: string) => {
    const task = appState.tasks.find((entry) => entry.id === taskId);
    if (!task) return;
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      description: task.description,
      pointValue: String(task.pointValue),
      deadline: "",
      autoReset: task.autoReset,
      assignedTo: "all",
      keyRewardType: task.keyRewardType,
      keyRewardQuantity: String(task.keyRewardQuantity || 1),
    });
  };

  const loadRewardForEdit = (rewardId: string) => {
    const reward = appState.rewards.find((entry) => entry.id === rewardId);
    if (!reward) return;
    setEditingRewardId(reward.id);
    setRewardForm({
      title: reward.title,
      description: reward.description,
      pointCost: String(reward.pointCost),
      icon: reward.icon,
      approvalKeyRequired: reward.approvalKeyRequired,
      requiredKeyType: reward.requiredKeyType,
      requiredKeyQuantity: String(reward.requiredKeyQuantity || 1),
    });
  };

  const removeTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      toast.error(error.message || "Could not delete task.");
      return;
    }
    await fetchAppData(currentUser?.id);
  };

  const removeReward = async (rewardId: string) => {
    const { error } = await supabase.from("rewards").delete().eq("id", rewardId);
    if (error) {
      toast.error(error.message || "Could not delete reward.");
      return;
    }
    await fetchAppData(currentUser?.id);
  };

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (resetPasswordForm.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: resetPasswordForm.password });
      if (error) throw error;
      setResetPasswordForm({ password: "", confirmPassword: "" });
      toast.success("Password updated. You can sign in now.");
      window.history.replaceState({}, "", window.location.pathname);
      await supabase.auth.signOut();
      await fetchAppData(null);
    } catch (error: any) {
      toast.error(error.message || "Could not update password.");
    }
  };

  return (
    <div className="app-shell min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(251,146,60,0.18),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(238,242,255,0.96))] text-foreground dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.2),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.14),_transparent_28%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.98))]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {currentUser ? (
          <header className="mb-6 flex flex-col gap-5 rounded-[2rem] border border-white/60 bg-white/70 p-5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/65 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700 dark:bg-sky-950/50 dark:text-sky-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Perfo Points
                </div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">PERFO POINTS for chores, goals, and rewards.</h1>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
                  Built for families with task proof photos, approval flows, point tracking, reward redemptions, and a layout that works cleanly on phones.
                </p>
              </div>
              <div className="flex items-center gap-3 self-end md:self-auto">
                <ThemeSwitch />
                <Button onClick={handleLogout} className="rounded-full">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-slate-900 px-3 py-1 font-medium text-white dark:bg-slate-100 dark:text-slate-900">{currentUser.displayName}</span>
              <span className="rounded-full border border-sky-300/70 bg-sky-50 px-3 py-1 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-200">{currentUser.role === "admin" ? "Admin dashboard" : "Kid dashboard"}</span>
              <span className="rounded-full border border-orange-300/70 bg-orange-50 px-3 py-1 text-orange-700 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-200">{currentUser.role === "user" ? `${currentUser.points} points available` : `${pendingRequests.length} pending approvals`}</span>
            </div>
          </header>
        ) : null}

        {isRecoveryMode ? (
          <Card className="mx-auto max-w-md border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <CardHeader>
              <CardTitle>Set a new password</CardTitle>
              <CardDescription>Finish your password reset and then sign back in.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                <Input
                  type="password"
                  placeholder="New password"
                  value={resetPasswordForm.password}
                  onChange={(event) => setResetPasswordForm((previous) => ({ ...previous, password: event.target.value }))}
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={resetPasswordForm.confirmPassword}
                  onChange={(event) => setResetPasswordForm((previous) => ({ ...previous, confirmPassword: event.target.value }))}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full rounded-full">Update password</Button>
              </CardFooter>
            </form>
          </Card>
        ) : shouldShowAuthScreen ? (
          <LoginView
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            signupForm={signupForm}
            setSignupForm={setSignupForm}
            resetEmail={resetEmail}
            setResetEmail={setResetEmail}
            onLogin={handleLogin}
            onSignup={handleSignup}
            onResetPassword={handleForgotPassword}
            onResendVerification={handleResendVerification}
            themeSwitch={<ThemeSwitch />}
            backendMessage={effectiveBackendMessage}
            pendingVerificationEmail={pendingVerificationEmail}
          />
        ) : loading ? (
          <div className="rounded-3xl border border-white/60 bg-white/80 p-10 text-center shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            Loading your Perfo Points data...
          </div>
        ) : currentUser.role === "admin" ? (
          <AdminView
            appState={appState}
            kids={kids}
            pendingRequests={pendingRequests}
            taskForm={taskForm}
            setTaskForm={setTaskForm}
            rewardForm={rewardForm}
            setRewardForm={setRewardForm}
            userForm={userForm}
            setUserForm={setUserForm}
            editingTaskId={editingTaskId}
            setEditingTaskId={setEditingTaskId}
            editingRewardId={editingRewardId}
            setEditingRewardId={setEditingRewardId}
            onUserSubmit={handleUserSubmit}
            onTaskSubmit={handleTaskSubmit}
            onRewardSubmit={handleRewardSubmit}
            onReviewRequest={handleReviewRequest}
            onAssignBonus={handleAssignBonus}
            onGrantKey={handleGrantKey}
            onResetPassword={handleResetPassword}
            onToggleBlocked={handleToggleBlocked}
            onResetCompletedTasks={handleResetCompletedTasks}
            editingUserId={editingUserId}
            userEditForm={userEditForm}
            setUserEditForm={setUserEditForm}
            onStartEditUser={startEditUser}
            onSaveUser={handleSaveUser}
            onSalahSettings={handleSalahSettings}
            onStartEditTask={loadTaskForEdit}
            onDeleteTask={removeTask}
            onStartEditReward={loadRewardForEdit}
            onDeleteReward={removeReward}
            onDailyLimitChange={() => toast.message("Daily redemption limit is still UI-only in this pass.")}
          />
        ) : (
          <UserDashboardView
            appState={appState}
            currentUser={currentUser}
            visibleTasks={visibleTasks}
            pointProgress={pointProgress}
            requestNotes={requestNotes}
            setRequestNotes={setRequestNotes}
            proofPhotos={proofPhotos}
            setProofPhotos={setProofPhotos}
            rewardKeys={rewardKeys}
            setRewardKeys={setRewardKeys}
            onSubmitPointRequest={handleSubmitPointRequest}
            onRedeemReward={handleRedeemReward}
            onUpdateSalahToday={handleUpdateSalahToday}
            onSaveOwnSettings={handleSaveOwnSettings}
            onChangeOwnPassword={handleChangeOwnPassword}
          />
        )}
      </div>
    </div>
  );
}
