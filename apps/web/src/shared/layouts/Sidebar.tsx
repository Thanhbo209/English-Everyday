import { NavLink } from "react-router-dom";
import {
  House,
  ChalkboardTeacher,
  Users,
  GearSix,
  Books,
  ChartLineUp,
  CaretLeft,
  SignOut,
  ClipboardText,
  Student,
} from "@phosphor-icons/react";
import { useAuth } from "@/features/auth";
import { Avatar } from "@/shared/components";
import { cn } from "@/shared/utils/utils";

/* ── Nav config ───────────────────────────────────────────── */
type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
};

const TEACHER_NAV: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: <House size={19} />,
    end: true,
  },
  {
    to: "/dashboard/classrooms",
    label: "Classrooms",
    icon: <ChalkboardTeacher size={19} />,
  },
  {
    to: "/dashboard/vocab-sets",
    label: "Vocab Sets",
    icon: <Books size={19} />,
  },
  { to: "/dashboard/students", label: "Students", icon: <Users size={19} /> },
  {
    to: "/dashboard/assignments",
    label: "Assignments",
    icon: <ClipboardText size={19} />,
  },
  { to: "/dashboard/settings", label: "Settings", icon: <GearSix size={19} /> },
];

const STUDENT_NAV: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: <House size={19} />,
    end: true,
  },
  {
    to: "/dashboard/classrooms",
    label: "My Classrooms",
    icon: <ChalkboardTeacher size={19} />,
  },
  {
    to: "/dashboard/vocab-sets",
    label: "Vocab Sets",
    icon: <Books size={19} />,
  },
  {
    to: "/dashboard/progress",
    label: "Progress",
    icon: <ChartLineUp size={19} />,
  },
  { to: "/dashboard/profile", label: "Profile", icon: <Student size={19} /> },
  { to: "/dashboard/settings", label: "Settings", icon: <GearSix size={19} /> },
];

/* ── Props ────────────────────────────────────────────────── */
interface SidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const navItems = user?.role === "TEACHER" ? TEACHER_NAV : STUDENT_NAV;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[99] bg-foreground/30 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "flex flex-col shrink-0 overflow-hidden",
          "bg-sidebar border-r border-sidebar-border",
          "transition-[width,transform] duration-200",
          /* desktop */
          "relative h-dvh z-[100]",
          collapsed ? "w-16" : "w-[240px]",
          /* mobile overlay */
          "max-md:fixed max-md:left-0 max-md:top-0 max-md:h-dvh max-md:w-[240px] max-md:z-[100]",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
        )}
      >
        {/* ── Logo & Toggle ── */}
        <div
          className={cn(
            "flex items-center h-14 border-b border-sidebar-border shrink-0 transition-all duration-200 relative group",
            collapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          {/* Logo & Brand text wrapper */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm transition-opacity duration-200",
                collapsed && "group-hover:opacity-0",
              )}
            >
              <span className="text-primary-foreground font-extrabold text-sm leading-none">
                E
              </span>
            </div>
            <span
              className={cn(
                "text-base font-bold text-sidebar-foreground whitespace-nowrap truncate transition-[opacity,width] duration-200",
                collapsed ? "opacity-0 w-0" : "opacity-100 w-auto",
              )}
            >
              EnglishEveryday
            </span>
          </div>

          {/* Collapse toggle (desktop only) ── */}
          <button
            onClick={onCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-200 max-md:hidden",
              collapsed
                ? "absolute left-4 top-3 w-8 h-8 opacity-0 group-hover:opacity-100 bg-sidebar border border-sidebar-border shadow-sm cursor-pointer"
                : "p-1.5 shrink-0 ml-2",
            )}
          >
            <CaretLeft
              size={16}
              weight="bold"
              className={cn(
                "transition-transform duration-200",
                collapsed && "rotate-180",
              )}
            />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-2 py-4 space-y-5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => {
                if (window.innerWidth < 768) onMobileClose();
              }}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 px-3 py-2 rounded-lg  text-sm font-medium",
                  "transition-all duration-150",
                  isActive
                    ? "bg-secondary text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 inset-y-[20%] w-0.5 bg-sidebar-primary rounded-r" />
                  )}
                  <span className="shrink-0 flex items-center">
                    {item.icon}
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap overflow-hidden transition-[opacity,width] duration-200",
                      collapsed ? "opacity-0 w-0" : "opacity-100",
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── User footer ── */}
        <div className="px-2 py-3 border-t border-sidebar-border shrink-0">
          <div className="flex items-center gap-3 px-2">
            <Avatar name={user?.name ?? "?"} src={user?.avatarUrl} size="sm" />

            <div
              className={cn(
                "flex-1 min-w-0 overflow-hidden",
                "transition-[opacity,width] duration-200",
                collapsed ? "opacity-0 w-0" : "opacity-100",
              )}
            >
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-[11px] text-muted-foreground capitalize">
                {user?.role?.toLowerCase()}
              </p>
            </div>

            <button
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-lg shrink-0",
                "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                "transition-all duration-150",
                collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
              )}
            >
              <SignOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
