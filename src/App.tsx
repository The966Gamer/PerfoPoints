
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SupabasePerfoPointsApp } from "@/perfo/SupabasePerfoPointsApp";

import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <SupabasePerfoPointsApp />
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}

export default App;
