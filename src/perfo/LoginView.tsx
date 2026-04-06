import { FormEvent, useState } from "react";
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
  const [showActions, setShowActions] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showReset, setShowReset] = useState(false);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <Card className="overflow-hidden border-white/60 bg-white/80 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
        <CardContent className="grid min-h-[620px] gap-8 p-6 lg:grid-cols-[1fr_320px] lg:p-10">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white dark:bg-white dark:text-slate-900">
              Family Rewards
            </div>
            <CardTitle className="mt-6 text-6xl font-black uppercase tracking-[0.14em] sm:text-7xl lg:text-8xl">PERFO POINTS</CardTitle>
            <CardDescription className="mt-5 max-w-2xl text-base leading-7 sm:text-lg">
              Make chores feel like progress with proof photos, point rewards, parent approvals, and savings goals that kids can actually follow.
            </CardDescription>
            <div className="mt-8 flex w-full max-w-md flex-col gap-3">
              <Button
                type="button"
                size="lg"
                className="h-14 rounded-full text-base font-bold uppercase tracking-[0.18em]"
                onClick={() => {
                  setShowActions(true);
                  setShowSignup(false);
                  setShowReset(false);
                }}
              >
                GET STARTED
              </Button>
              <p className="text-sm text-muted-foreground">See the features, then jump into sign up or sign in.</p>
            </div>
          </div>

          {showActions ? (
            <div className="space-y-4">
              <FeatureCard icon={<ClipboardCheck className="mb-3 h-8 w-8" />} title="Task approvals" body="Completed chores can include a proof photo before an admin approves the points." className="from-sky-500 to-cyan-400" />
              <FeatureCard icon={<Gift className="mb-3 h-8 w-8" />} title="Reward redemptions" body="Kids save points for rewards while parents stay in control of the final approval." className="from-orange-500 to-amber-400" />
              <FeatureCard icon={<Wallet className="mb-3 h-8 w-8" />} title="Balances and history" body="Track points earned, points spent, streaks, and family progress across devices." className="from-emerald-500 to-lime-400" />
              <FeatureCard icon={<Shield className="mb-3 h-8 w-8" />} title="Parent tools" body="Admins can add users, reset passwords, approve tasks, and manage the whole family dashboard." className="from-fuchsia-500 to-pink-400" />
            </div>
          ) : (
            <div className="hidden lg:block" />
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {showActions ? (
          <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <CardHeader>
              <CardTitle>Start here</CardTitle>
              <CardDescription>See the features, then choose sign in or sign up.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                className="h-14 w-full rounded-full text-base font-bold uppercase tracking-[0.1em]"
                onClick={() => {
                  setShowSignup(true);
                  setShowReset(false);
                }}
              >
                <UserPlus className="h-4 w-4" />
                Sign up
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-12 w-full rounded-full text-base font-semibold"
                onClick={() => {
                  setShowSignup(false);
                  setShowReset(false);
                }}
              >
                <Lock className="h-4 w-4" />
                Sign in
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {showActions ? (
          <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Use your email or username and your password to open the family dashboard.</CardDescription>
            </CardHeader>
            <form onSubmit={onLogin}>
              <CardContent className="space-y-4">
                <Input value={loginForm.emailOrUsername} onChange={(event) => setLoginForm((previous) => ({ ...previous, emailOrUsername: event.target.value }))} placeholder="Email or username" />
                <Input type="password" value={loginForm.password} onChange={(event) => setLoginForm((previous) => ({ ...previous, password: event.target.value }))} placeholder="Password" />
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full rounded-full">
                  <Lock className="h-4 w-4" />
                  Enter dashboard
                </Button>
                <Button type="button" variant="outline" className="w-full rounded-full" onClick={() => {
                  setShowReset((previous) => !previous);
                  setShowSignup(false);
                  setShowActions(true);
                }}>
                  <Mail className="h-4 w-4" />
                  {showReset ? "Close reset" : "Reset password"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : null}

        {showSignup ? (
          <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <CardHeader>
              <CardTitle>Create account</CardTitle>
              <CardDescription>Make a new Perfo Points account for your family and start tracking chores, rewards, proof photos, and progress.</CardDescription>
            </CardHeader>
            <form onSubmit={onSignup}>
              <CardContent className="space-y-4">
                <div className="grid gap-2 rounded-2xl border border-white/60 bg-white/70 p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-slate-950/40">
                  <p>Includes:</p>
                  <p>Task approvals and reward saving</p>
                  <p>Photo proof uploads for completed chores</p>
                  <p>Parent controls, resets, and family history</p>
                </div>
                <Input type="email" value={signupForm.email} onChange={(event) => setSignupForm((previous) => ({ ...previous, email: event.target.value }))} placeholder="Email" />
                <Input value={signupForm.username} onChange={(event) => setSignupForm((previous) => ({ ...previous, username: event.target.value }))} placeholder="Username" />
                <Input value={signupForm.displayName} onChange={(event) => setSignupForm((previous) => ({ ...previous, displayName: event.target.value }))} placeholder="Display name" />
                <Input type="password" value={signupForm.password} onChange={(event) => setSignupForm((previous) => ({ ...previous, password: event.target.value }))} placeholder="Password" />
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full rounded-full">
                  <UserPlus className="h-4 w-4" />
                  Sign up
                </Button>
                <Button type="button" variant="ghost" className="w-full rounded-full" onClick={() => setShowSignup(false)}>
                  Already have an account? Sign in
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : null}

        {showReset ? (
          <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <CardHeader>
              <CardTitle>Reset password</CardTitle>
              <CardDescription>Send yourself a reset email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="email" value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} placeholder="Email for reset link" />
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button onClick={onResetPassword} className="flex-1 rounded-full">
                <Mail className="h-4 w-4" />
                Send reset link
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setShowReset(false)}>
                Close
              </Button>
            </CardFooter>
          </Card>
        ) : null}
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
