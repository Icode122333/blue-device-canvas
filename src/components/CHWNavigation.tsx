const tabs = [
  { id: "overview", label: "Overview", active: true },
  { id: "reports", label: "Reports", active: false },
  { id: "questions", label: "Questions Answered", active: false },
];

export const CHWNavigation = () => {
  return (
    <div className="bg-card border-b border-border px-4 py-2">
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
              tab.active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};