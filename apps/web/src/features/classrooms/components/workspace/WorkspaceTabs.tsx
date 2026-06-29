import { House, ClipboardText, Books, Users, ChartLine, ChartBar, Gear } from "@phosphor-icons/react";
import type { ElementType } from "react";

interface TabConfig {
  id: string;
  label: string;
  icon: ElementType;
}

const tabConfigs: Record<string, TabConfig> = {
  overview: { id: "overview", label: "Overview", icon: House },
  assignments: { id: "assignments", label: "Assignments", icon: ClipboardText },
  vocabulary: { id: "vocabulary", label: "Vocab", icon: Books },
  members: { id: "members", label: "Members", icon: Users },
  analytics: { id: "analytics", label: "Analytics", icon: ChartLine },
  progress: { id: "progress", label: "Progress", icon: ChartBar },
  settings: { id: "settings", label: "Settings", icon: Gear },
};

interface WorkspaceTabsProps {
  tabs: Array<{ id: string; roles: string[] }>;
  activeTab: string;
  onTabChange: (id: string) => void;
  theme: { text: string; lightBg: string };
}

export function WorkspaceTabs({
  tabs,
  activeTab,
  onTabChange,
  theme,
}: WorkspaceTabsProps) {
  return (
    <div className="flex border-b border-border bg-card overflow-x-auto select-none rounded-xl p-1 shadow-sm md:hidden">
      {tabs.map((tab) => {
        const config = tabConfigs[tab.id];
        if (!config) return null;
        
        const Icon = config.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 gap-1 text-[10px] font-bold rounded-lg transition-all min-w-[64px] cursor-pointer ${
              isActive
                ? `${theme.lightBg} ${theme.text} font-black`
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
            }`}
          >
            <Icon size={16} weight={isActive ? "fill" : "regular"} />
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
