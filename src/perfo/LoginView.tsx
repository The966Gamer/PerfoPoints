import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, ClipboardCheck, Gift, Lock, Mail, Shield, UserPlus, Wallet } from "lucide-react";

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
  onResendVerification,
  onEditPendingSignup,
  themeSwitch,
  backendMessage,
  pendingVerificationEmail,
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
  onResendVerification: () => void;
  onEditPendingSignup: () => void;
  themeSwitch: React.ReactNode;
  backendMessage: string | null;
  pendingVerificationEmail: string;
}) {
  const [step, setStep] = useState<"intro" | "features" | "auth">("intro");
  const [showSignin, setShowSignin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    if (!pendingVerificationEmail) return;
    setStep("auth");
    setShowSignin(false);
    setShowSignup(false);
    setShowReset(false);
  }, [pendingVerificationEmail]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-white/60 bg-white/80 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
        <CardContent className="min-h-[78vh] p-6 sm:p-8 lg:p-12">
          <div className="flex h-full min-h-[70vh] flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white dark:bg-white dark:text-slate-900">
                Family Rewards
              </div>
              <div className="shrink-0">{themeSwitch}</div>
            </div>

            {backendMessage ? (
              <div className="mt-6 flex items-start gap-3 rounded-3xl border border-amber-300/70 bg-amber-50/90 p-4 text-left text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{backendMessage}</p>
              </div>
            ) : null}

            {step === "intro" ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <CardTitle className="max-w-5xl text-6xl font-black uppercase tracking-[0.12em] sm:text-7xl lg:text-[8rem]">
                  PERFO POINTS
                </CardTitle>
                <CardDescription className="mt-6 max-w-4xl text-lg leading-8 sm:text-xl">
                  Make chores feel like progress with proof photos, point rewards, parent approvals, and savings goals that kids can actually follow.
                </CardDescription>
                <div className="mt-10 flex w-full max-w-xl flex-col gap-3">
                  <Button
                    type="button"
                    size="lg"
                    className="h-16 rounded-full text-base font-bold uppercase tracking-[0.18em]"
                    onClick={() => {
                      setStep("features");
                      setShowSignin(false);
                      setShowSignup(false);
                      setShowReset(false);
                    }}
                  >
                    GET STARTED
                  </Button>
                  <p className="text-sm text-muted-foreground">See the features, then jump into sign up or sign in.</p>
                </div>
              </div>
            ) : null}

            {step === "features" ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="max-w-3xl">
                  <CardTitle className="text-4xl font-black uppercase tracking-[0.1em] sm:text-5xl">
                    Why Families Use It
                  </CardTitle>
                  <CardDescription className="mt-4 text-base leading-7 sm:text-lg">
                    Keep chores simple, rewards motivating, and parent approvals easy to manage.
                  </CardDescription>
                </div>
                <div className="mt-10 grid gap-4 lg:grid-cols-2">
                  <FeatureCard icon={<ClipboardCheck className="mb-3 h-8 w-8" />} title="Task approvals" body="Completed chores can include a proof photo before an admin approves the points." className="from-sky-500 to-cyan-400" />
                  <FeatureCard icon={<Gift className="mb-3 h-8 w-8" />} title="Reward redemptions" body="Kids save points for rewards while parents stay in control of the final approval." className="from-orange-500 to-amber-400" />
                  <FeatureCard icon={<Wallet className="mb-3 h-8 w-8" />} title="Balances and history" body="Track points earned, points spent, streaks, and family progress across devices." className="from-emerald-500 to-lime-400" />
                  <FeatureCard icon={<Shield className="mb-3 h-8 w-8" />} title="Parent tools" body="Admins can add users, reset passwords, approve tasks, and manage the whole family dashboard." className="from-fuchsia-500 to-pink-400" />
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    size="lg"
                    className="h-14 rounded-full px-8 text-base font-bold uppercase tracking-[0.14em]"
                    onClick={() => {
                      setStep("auth");
                      setShowSignin(false);
                      setShowSignup(false);
                      setShowReset(false);
                    }}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-14 rounded-full px-8"
                    onClick={() => setStep("intro")}
                  >
                    Back
                  </Button>
                </div>
              </div>
            ) : null}

            {step === "auth" ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                {!showSignin && !showSignup && !showReset ? (
                  <>
                    <div className="max-w-3xl">
                      <CardTitle className="text-4xl font-black uppercase tracking-[0.1em] sm:text-5xl">
                        Choose Your Start
                      </CardTitle>
                      <CardDescription className="mt-4 text-base leading-7 sm:text-lg">
                        Sign in to your family dashboard or create a new Perfo Points account.
                      </CardDescription>
                    </div>
                    <div className="mt-8 flex max-w-xl flex-col gap-4 sm:flex-row">
                      <Button
                        type="button"
                        className="h-14 flex-1 rounded-full text-base font-bold uppercase tracking-[0.1em]"
                        onClick={() => {
                          setShowSignin(true);
                          setShowSignup(false);
                          setShowReset(false);
                        }}
                      >
                        <Lock className="h-4 w-4" />
                        Sign in
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-14 flex-1 rounded-full text-base font-bold uppercase tracking-[0.1em]"
                        onClick={() => {
                          setShowSignin(false);
                          setShowSignup(true);
                          setShowReset(false);
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                        Sign up
                      </Button>
                    </div>
                    <div className="mt-6 max-w-xl">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-12 rounded-full px-0"
                        onClick={() => {
                          setStep("features");
                          setShowSignin(false);
                          setShowSignup(false);
                          setShowReset(false);
                        }}
                      >
                        Back to features
                      </Button>
                    </div>
                    {pendingVerificationEmail ? (
                      <div className="mt-8 w-full max-w-xl rounded-[2rem] border border-sky-300/70 bg-sky-50/90 p-6 text-center shadow-lg dark:border-sky-900/70 dark:bg-sky-950/45">
                        <CardTitle className="text-2xl font-black uppercase tracking-[0.08em]">Confirm Your Email</CardTitle>
                        <CardDescription className="mt-3 text-base">
                          We created your account. Open the email sent to {pendingVerificationEmail}, confirm it, then sign in here.
                        </CardDescription>
                        <div className="mt-5 flex flex-col gap-3">
                          <Button type="button" className="w-full rounded-full" onClick={onResendVerification}>
                            <Mail className="h-4 w-4" />
                            Resend confirmation email
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full rounded-full"
                            onClick={() => {
                              onEditPendingSignup();
                              setShowSignup(true);
                              setShowSignin(false);
                              setShowReset(false);
                            }}
                          >
                            <UserPlus className="h-4 w-4" />
                            Wrong email? Change it
                          </Button>
                          <Button type="button" variant="secondary" className="w-full rounded-full" onClick={() => setShowSignin(true)}>
                            <Lock className="h-4 w-4" />
                            I confirmed, let me sign in
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}

                {showSignin ? (
                  <div className="w-full max-w-xl rounded-[2rem] border border-white/60 bg-white/75 p-6 text-left shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
                    <div className="mb-6 text-center">
                      <CardTitle className="text-3xl font-black uppercase tracking-[0.08em]">Sign in</CardTitle>
                      <CardDescription className="mt-3 text-base">
                        Use your email or username and your password to open the family dashboard.
                      </CardDescription>
                    </div>
                    <form onSubmit={onLogin}>
                      <div className="space-y-4">
                        <Input value={loginForm.emailOrUsername} onChange={(event) => setLoginForm((previous) => ({ ...previous, emailOrUsername: event.target.value }))} placeholder="Email or username" />
                        <Input type="password" value={loginForm.password} onChange={(event) => setLoginForm((previous) => ({ ...previous, password: event.target.value }))} placeholder="Password" />
                      </div>
                      <div className="mt-6 flex flex-col gap-3">
                        <Button type="submit" className="w-full rounded-full">
                          <Lock className="h-4 w-4" />
                          Enter dashboard
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full rounded-full"
                          onClick={() => {
                            setShowSignin(false);
                            setShowReset(true);
                            setShowSignup(false);
                          }}
                        >
                          <Mail className="h-4 w-4" />
                          Reset password
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full rounded-full"
                          onClick={() => {
                            setShowSignin(false);
                            setShowSignup(false);
                            setShowReset(false);
                          }}
                        >
                          Back
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : null}

                {showSignup ? (
                  <div className="w-full max-w-xl rounded-[2rem] border border-white/60 bg-white/75 p-6 text-left shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
                    <div className="mb-6 text-center">
                      <CardTitle className="text-3xl font-black uppercase tracking-[0.08em]">Create account</CardTitle>
                      <CardDescription className="mt-3 text-base">
                        Make a new Perfo Points account for your family and start tracking chores, rewards, proof photos, and progress.
                      </CardDescription>
                    </div>
                    <form onSubmit={onSignup}>
                      <div className="space-y-4">
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
                      </div>
                      <div className="mt-6 flex flex-col gap-3">
                        <Button type="submit" className="w-full rounded-full">
                          <UserPlus className="h-4 w-4" />
                          Sign up
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full rounded-full"
                          onClick={() => {
                            setShowSignup(false);
                            setShowSignin(true);
                          }}
                        >
                          Already have an account? Sign in
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : null}

                {showReset ? (
                  <div className="w-full max-w-xl rounded-[2rem] border border-white/60 bg-white/75 p-6 text-left shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
                    <div className="mb-6 text-center">
                      <CardTitle className="text-3xl font-black uppercase tracking-[0.08em]">Reset password</CardTitle>
                      <CardDescription className="mt-3 text-base">
                        Send yourself a reset email.
                      </CardDescription>
                    </div>
                    <div className="space-y-4">
                      <Input type="email" value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} placeholder="Email for reset link" />
                    </div>
                    <div className="mt-6 flex flex-col gap-3">
                      <Button onClick={onResetPassword} className="w-full rounded-full">
                        <Mail className="h-4 w-4" />
                        Send reset link
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full rounded-full"
                        onClick={() => {
                          setShowReset(false);
                          setShowSignin(true);
                        }}
                      >
                        Back to sign in
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
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
