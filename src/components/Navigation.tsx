import { Home, Play, Calendar, Users, MessageCircle } from "lucide-react";

const tabs = [
  { id: "home", label: "Home", icon: Home, active: true },
  { id: "devices", label: "Devices", icon: Play, active: false },
  { id: "schedule", label: "Schedule", icon: Calendar, active: false },
  { id: "community", label: "Community", icon: Users, active: false },
  { id: "qa", label: "Q&A", icon: MessageCircle, active: false },
];

export const Navigation = () => {
  return (
    <>
      {/* Top Navigation */}
      <div className="flex bg-background px-4 py-2 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
              tab.active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex justify-around py-3">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                  tab.active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};