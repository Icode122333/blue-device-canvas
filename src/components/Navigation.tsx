import { Calendar, Home, Play, Users } from "lucide-react";

const tabs = [
  { id: "home", label: "Home", iconSrc: "/home.png" },
  { id: "exercises", label: "Exercises", iconSrc: "/video-camera.png" },
  { id: "schedule", label: "Schedule", iconSrc: "/calendar.png" },
  { id: "community", label: "Community", iconSrc: "/group.png" },
];

export const Navigation = ({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) => {
  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="mobile-dock pointer-events-auto w-full max-w-md rounded-[2rem] px-2 py-2">
        <nav className="grid grid-cols-4 gap-1" aria-label="Patient Navigation">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                aria-label={tab.label}
                aria-pressed={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-[1.35rem] px-2 py-3 text-center transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_16px_30px_hsl(79_100%_62%_/_0.22)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                <img 
                  src={tab.iconSrc} 
                  alt={tab.label} 
                  className={`h-5 w-5 object-contain transition-all duration-300 ${isActive ? "scale-105 brightness-0" : "brightness-0 invert opacity-70 hover:opacity-100"}`} 
                />
                <span className="text-[11px] font-semibold tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
