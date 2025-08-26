import { Home, Play, Calendar, Users } from "lucide-react";

const tabs = [
  { id: "home", label: "Home", icon: Home, variant: "default" },
  { id: "exercises", label: "exercises", icon: Play, variant: "primary" },
  { id: "schedule", label: "Schedule", icon: Calendar, variant: "default" },
  { id: "community", label: "Community", icon: Users, variant: "default" },
];

export const Navigation = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => {
  return (
    <>
      {/* Bottom Pill Glass Navigation */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto inline-flex rounded-full border border-white/50 ring-1 ring-white/40 bg-white/70 backdrop-blur-xl shadow-[0_12px_36px_rgba(15,23,42,0.18)] clay-fade-in">
          <nav className="flex items-center justify-center gap-3 px-3 py-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isPrimary = tab.variant === "primary" && activeTab === tab.id;
              const isActive = activeTab === tab.id;
              const baseBtn =
                "flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent hover:scale-[1.02] active:scale-[0.98]";
              const primaryBtn =
                "w-12 h-12 bg-emerald-500 hover:bg-emerald-500/95 text-white border border-emerald-300 shadow-[0_8px_20px_rgba(16,185,129,0.35)]";
              const defaultBtn = `${
                isActive
                  ? "bg-white/90 text-slate-900 shadow-[inset_0_2px_6px_rgba(0,0,0,.06),0_8px_18px_rgba(15,23,42,.10)]"
                  : "bg-white/60 text-slate-700 hover:bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_6px_12px_rgba(15,23,42,.06)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_10px_18px_rgba(15,23,42,.10)]"
              } border border-white/70 w-12 h-12`;
              return (
                <div key={tab.id} className="flex flex-col items-center gap-1">
                  <button 
                    aria-label={tab.label} 
                    className={`${baseBtn} ${isPrimary ? primaryBtn : defaultBtn}`}
                    onClick={() => onTabChange(tab.id)}
                  >
                    <IconComponent className="h-5 w-5 drop-shadow-sm" strokeWidth={1.75} />
                  </button>
                  <span className={`text-[11px] font-semibold tracking-wide ${isActive ? "text-slate-900" : "text-slate-700/90"}`}>
                    {tab.label}
                  </span>
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};