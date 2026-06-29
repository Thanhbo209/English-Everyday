import {
  House,
  ClipboardText,
  Books,
  Users,
  ChartLine,
  ChartBar,
  Gear,
} from "@phosphor-icons/react";
import type { ElementType } from "react";

interface TabConfig {
  id: string;
  label: string;
  icon: ElementType;
}

const tabConfigs: Record<string, TabConfig> = {
  overview: { id: "overview", label: "Overview", icon: House },
  assignments: { id: "assignments", label: "Assignments", icon: ClipboardText },
  vocabulary: { id: "vocabulary", label: "Vocabulary Decks", icon: Books },
  members: { id: "members", label: "Members", icon: Users },
  analytics: { id: "analytics", label: "Analytics", icon: ChartLine },
  progress: { id: "progress", label: "My Progress", icon: ChartBar },
  settings: { id: "settings", label: "Settings", icon: Gear },
};

interface WorkspaceSidebarProps {
  tabs: Array<{ id: string; roles: string[] }>;
  activeTab: string;
  onTabChange: (id: string) => void;
  theme: { bg: string; text: string; lightBg: string };
}

export function WorkspaceSidebar({
  tabs,
  activeTab,
  onTabChange,
  theme,
}: WorkspaceSidebarProps) {
  return (
    <aside className="w-full md:w-56 shrink-0 bg-card border border-border/80 rounded-2xl p-4 space-y-1.5 shadow-sm h-fit select-none">
      <div className="px-3 pb-3 mb-2 border-b border-border/60">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Class Navigation</p>
      </div>

      <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 pb-2 md:pb-0">
        {tabs.map((tab) => {
          const config = tabConfigs[tab.id];
          if (!config) return null;
          
          const Icon = config.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? `${theme.lightBg} ${theme.text} font-extrabold border border-primary/20`
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground border border-transparent"
              }`}
            >
              <Icon size={16} weight={isActive ? "fill" : "regular"} />
              {config.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
