import { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="border-white/50 bg-white/85 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/80 p-3 text-slate-900 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="rounded-2xl bg-sky-100 p-3 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200">{icon}</div>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="rounded-full border-white/60 bg-white/75 backdrop-blur dark:border-white/10 dark:bg-slate-950/65"
      title={`Switch to ${dark ? "light" : "dark"} mode`}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
