import { FormEvent } from "react";
import { ClipboardCheck, Gift, Lock, Mail, Shield, UserPlus, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginView({
  loginForm,
  setLoginForm,
  signupForm,
  setSignupForm,
  resetEmail,
  setResetEmail,
  onLogin,
  onSignup,
  onResetPassword,
}: {
  loginForm: { emailOrUsername: string; password: string };
  setLoginForm: React.Dispatch<React.SetStateAction<{ emailOrUsername: string; password: string }>>;
  signupForm: { email: string; username: string; displayName: string; password: string };
  setSignupForm: React.Dispatch<React.SetStateAction<{ email: string; username: string; displayName: string; password: string }>>;
  resetEmail: string;
  setResetEmail: React.Dispatch<React.SetStateAction<string>>;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onSignup: (event: FormEvent<HTMLFormElement>) => void;
  onResetPassword: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="overflow-hidden border-white/60 bg-white/80 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
        <CardHeader>
          <CardTitle className="text-3xl">Supabase-backed family rewards, built for desktop and phone.</CardTitle>
          <CardDescription>
            Parents manage tasks, kids submit proof photos, rewards use real point balances, and password recovery works through email.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FeatureCard icon={<ClipboardCheck className="mb-3 h-8 w-8" />} title="Task approvals" body="Completed chores can include a proof photo before an admin approves the points." className="from-sky-500 to-cyan-400" />
          <FeatureCard icon={<Gift className="mb-3 h-8 w-8" />} title="Reward redemptions" body="Rewards deduct points from the real Supabase profile balance and keep history." className="from-orange-500 to-amber-400" />
          <FeatureCard icon={<Wallet className="mb-3 h-8 w-8" />} title="Shared family data" body="Tasks, rewards, requests, and balances persist across devices instead of local-only storage." className="from-emerald-500 to-lime-400" />
          <FeatureCard icon={<Shield className="mb-3 h-8 w-8" />} title="Recovery and roles" body="Email-based login, password reset links, and admin tools all run through Supabase." className="from-fuchsia-500 to-pink-400" />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use your email or username and your password.</CardDescription>
          </CardHeader>
          <form onSubmit={onLogin}>
            <CardContent className="space-y-4">
              <Input value={loginForm.emailOrUsername} onChange={(event) => setLoginForm((previous) => ({ ...previous, emailOrUsername: event.target.value }))} placeholder="Email or username" />
              <Input type="password" value={loginForm.password} onChange={(event) => setLoginForm((previous) => ({ ...previous, password: event.target.value }))} placeholder="Password" />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full rounded-full">
                <Lock className="h-4 w-4" />
                Enter dashboard
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>New family members can sign up here. Admin role must still exist in Supabase profiles.</CardDescription>
          </CardHeader>
          <form onSubmit={onSignup}>
            <CardContent className="space-y-4">
              <Input type="email" value={signupForm.email} onChange={(event) => setSignupForm((previous) => ({ ...previous, email: event.target.value }))} placeholder="Email" />
              <Input value={signupForm.username} onChange={(event) => setSignupForm((previous) => ({ ...previous, username: event.target.value }))} placeholder="Username" />
              <Input value={signupForm.displayName} onChange={(event) => setSignupForm((previous) => ({ ...previous, displayName: event.target.value }))} placeholder="Display name" />
              <Input type="password" value={signupForm.password} onChange={(event) => setSignupForm((previous) => ({ ...previous, password: event.target.value }))} placeholder="Password" />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full rounded-full">
                <UserPlus className="h-4 w-4" />
                Sign up
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>Send yourself a reset email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="email" value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} placeholder="Email for reset link" />
          </CardContent>
          <CardFooter>
            <Button onClick={onResetPassword} className="w-full rounded-full">
              <Mail className="h-4 w-4" />
              Send reset link
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  className: string;
}) {
  return (
    <div className={`rounded-3xl bg-gradient-to-br p-5 text-white shadow-lg ${className}`}>
      {icon}
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-white/90">{body}</p>
    </div>
  );
}
