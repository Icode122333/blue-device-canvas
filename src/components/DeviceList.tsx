import { Play, CheckCircle, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const devices = [
  {
    id: 1,
    name: "Mobility Walker",
    duration: "10 min",
    points: 50,
    difficulty: "Easy",
    status: "completed" as const,
    icon: CheckCircle,
    bgColor: "bg-green-500"
  },
  {
    id: 2,
    name: "Balance Trainer",
    duration: "15 min", 
    points: 75,
    difficulty: "Medium",
    status: "pending" as const,
    icon: Play,
    bgColor: "bg-primary"
  },
  {
    id: 3,
    name: "Leg Strengthener",
    duration: "12 min",
    points: 65,
    difficulty: "Medium", 
    status: "pending" as const,
    icon: Play,
    bgColor: "bg-primary"
  }
];

export const DeviceList = () => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Today's Devices</h2>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Add Custom
        </button>
      </div>
      
      <div className="space-y-3">
        {devices.map((device) => {
          const IconComponent = device.icon;
          return (
            <div key={device.id} className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all">
              <div className={`p-2 rounded-lg ${device.bgColor}`}>
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-card-foreground">{device.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{device.duration}</span>
                  {device.status === "completed" && (
                    <span className="text-sm text-green-600 font-medium">Completed!</span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <Badge 
                  variant={device.difficulty === "Easy" ? "secondary" : "default"}
                  className={device.difficulty === "Easy" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}
                >
                  {device.difficulty}
                </Badge>
                <div className="text-sm text-primary font-semibold mt-1">
                  +{device.points} points
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};