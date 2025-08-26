import { LayoutDashboard, BarChart3, MessageCircle } from "lucide-react";
import React from "react";

type TabId = "overview" | "reports" | "questions";

interface CHWNavigationProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "questions", label: "Questions", icon: MessageCircle },
];

export const CHWNavigation: React.FC<CHWNavigationProps> = ({ active, onChange }) => {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto inline-flex rounded-full border border-white/50 ring-1 ring-white/40 bg-white/70 backdrop-blur-xl shadow-[0_12px_36px_rgba(15,23,42,0.18)] clay-fade-in">
        <nav className="flex items-center justify-center gap-3 px-3 py-2" aria-label="CHW Navigation">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = active === tab.id;
            const isPrimary = isActive; // highlight the active tab in green
            const baseBtn =
              "flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent hover:scale-[1.02] active:scale-[0.98]";
            const primaryBtn = "w-12 h-12 bg-emerald-500 hover:bg-emerald-500/95 text-white border border-emerald-300 shadow-[0_8px_20px_rgba(16,185,129,0.35)]";
            const defaultBtn = `${
              isActive
                ? "bg-white/90 text-slate-900 shadow-[inset_0_2px_6px_rgba(0,0,0,.06),0_8px_18px_rgba(15,23,42,.10)]"
                : "bg-white/60 text-slate-700 hover:bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_6px_12px_rgba(15,23,42,.06)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_10px_18px_rgba(15,23,42,.10)]"
            } border border-white/70 w-12 h-12`;
            return (
              <div key={tab.id} className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  aria-label={tab.label}
                  aria-pressed={isActive}
                  className={`${baseBtn} ${isPrimary ? primaryBtn : defaultBtn}`}
                  onClick={() => onChange(tab.id)}
                >
                  <IconComponent className="h-5 w-5 drop-shadow-sm" />
                </button>
                <span
                  onClick={() => onChange(tab.id)}
                  className={`text-[11px] font-semibold tracking-wide ${isActive ? "text-slate-900" : "text-slate-700/90"} cursor-pointer select-none`}
                >
                  {tab.label}
                </span>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};