import { BarChart3, LayoutDashboard, MessageCircle } from "lucide-react";
import React from "react";

type TabId = "overview" | "reports" | "questions";

interface CHWNavigationProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "questions", label: "Questions", icon: MessageCircle },
];

export const CHWNavigation: React.FC<CHWNavigationProps> = ({ active, onChange }) => {
  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="mobile-dock pointer-events-auto w-full max-w-sm rounded-[2rem] px-2 py-2">
        <nav className="grid grid-cols-3 gap-1" aria-label="CHW Navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                aria-label={tab.label}
                aria-pressed={isActive}
                onClick={() => onChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-[1.35rem] px-2 py-3 text-center transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_16px_30px_hsl(79_100%_62%_/_0.22)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.9} />
                <span className="text-[11px] font-semibold tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
