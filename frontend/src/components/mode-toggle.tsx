import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center w-14 h-7 rounded-full bg-muted border border-border/50 transition-colors hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-background"
      aria-label="Toggle theme"
    >
      <span
        className={`absolute left-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-background shadow-sm transition-transform duration-200 ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon className="size-3.5 text-indigo-500" />
        ) : (
          <Sun className="size-3.5 text-amber-500" />
        )}
      </span>
    </button>
  );
}

export function FloatingThemeToggle() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <ModeToggle />
    </div>
  );
}
