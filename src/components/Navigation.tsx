import { Home, Play, Calendar, Users, MessageCircle } from "lucide-react";

const tabs = [
  { id: "home", label: "Home", icon: Home, variant: "default" },
  { id: "devices", label: "Devices", icon: Play, variant: "primary" },
  { id: "schedule", label: "Schedule", icon: Calendar, variant: "default" },
  { id: "community", label: "Community", icon: Users, variant: "default" },
  { id: "qa", label: "Q&A", icon: MessageCircle, variant: "default" },
];

export const Navigation = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => {
  return (
    <>
      {/* Bottom Pill Glass Navigation */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto inline-flex rounded-full border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
          <nav className="flex items-center justify-center gap-3 px-3 py-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isPrimary = tab.variant === "primary" && activeTab === tab.id;
              const isActive = activeTab === tab.id;
              const baseBtn =
                "flex items-center justify-center rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
              const primaryBtn =
                "w-12 h-12 bg-[#00ff88] text-black shadow-[0_4px_16px_rgba(0,255,136,0.25)]";
              const defaultBtn = `${
                isActive
                  ? "bg-white/90 text-slate-900"
                  : "bg-white/60 text-slate-700 hover:bg-white/75"
              } border border-white/70 w-12 h-12`;
              return (
                <div key={tab.id} className="flex flex-col items-center gap-1">
                  <button 
                    aria-label={tab.label} 
                    className={`${baseBtn} ${isPrimary ? primaryBtn : defaultBtn}`}
                    onClick={() => onTabChange(tab.id)}
                  >
                    <IconComponent className="h-5 w-5" />
                  </button>
                  <span className={`text-[11px] font-medium ${isActive ? "text-slate-900" : "text-slate-700/90"}`}>
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