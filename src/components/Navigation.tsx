import { Home, Play, Calendar, Users } from "lucide-react";

const tabs = [
  { id: "home", label: "Home", icon: Home, variant: "default" },
  { id: "devices", label: "Devices", icon: Play, variant: "primary" },
  { id: "schedule", label: "Schedule", icon: Calendar, variant: "default" },
  { id: "community", label: "Community", icon: Users, variant: "default" },
];

export const Navigation = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => {
  return (
    <>
      {/* Bottom Pill Glass Navigation */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto inline-flex rounded-full border border-white/40 bg-white/80 backdrop-blur-xl shadow-lg">
          <nav className="flex items-center justify-center gap-2 px-4 py-3">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isPrimary = tab.variant === "primary" && activeTab === tab.id;
              const isActive = activeTab === tab.id;
              const baseBtn =
                "flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent hover:scale-110";
              const primaryBtn =
                "w-14 h-14 bg-primary text-primary-foreground shadow-lg hover:shadow-xl transform hover:-translate-y-1";
              const defaultBtn = `${
                isActive
                  ? "bg-white text-primary shadow-md"
                  : "bg-white/70 text-muted-foreground hover:bg-white hover:text-primary"
              } border border-white/20 w-12 h-12`;
              return (
                <div key={tab.id} className="flex flex-col items-center gap-1">
                  <button 
                    aria-label={tab.label} 
                    className={`${baseBtn} ${isPrimary ? primaryBtn : defaultBtn}`}
                    onClick={() => onTabChange(tab.id)}
                  >
                    <IconComponent className="h-5 w-5" />
                  </button>
                   <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
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