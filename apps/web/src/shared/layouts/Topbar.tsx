import { Bell, List, Sun, Moon } from "@phosphor-icons/react";
import { useAuth } from "@/features/auth";
import { Avatar, Badge } from "@/shared/components";
import { useCallback, useState } from "react";

interface TopbarProps {
  onMobileMenu: () => void;
}

/** Reads/writes the .dark class on <html> and persists to localStorage. */
function useTheme() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  const toggle = useCallback(() => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  }, [isDark]);

  return { isDark, toggle };
}

export function Topbar({ onMobileMenu }: TopbarProps) {
  const { user } = useAuth();
  const { isDark, toggle } = useTheme();
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="h-14 flex items-center gap-4 px-4 sm:px-6 bg-card border-b border-border shrink-0 sticky top-0 z-[90]">
      {/* Mobile menu */}
      <button
        onClick={onMobileMenu}
        aria-label="Open navigation menu"
        className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <List size={18} />
      </button>

      {/* Page title */}
      <h1 className="flex-1 text-base font-semibold text-foreground truncate">
        {greeting}, {user?.name?.split(" ")[0]}
      </h1>

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Role badge */}
        <Badge
          variant={user?.role === "TEACHER" ? "accent" : "info"}
          className="hidden sm:inline-flex"
        >
          {user?.role}
        </Badge>

        {/* Divider */}
        <div className="w-px h-5 bg-border hidden sm:block" />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        {/* Avatar */}
        <Avatar name={user?.name ?? "?"} src={user?.avatarUrl} size="sm" />
      </div>
    </header>
  );
}
