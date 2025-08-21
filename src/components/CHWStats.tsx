import { Users, MapPin, FileText, AlertTriangle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    id: 1,
    title: "Assigned Patients",
    value: "15",
    change: "+8%",
    icon: Users,
    color: "bg-primary",
    trend: "up"
  },
  {
    id: 2,
    title: "Visits This Week", 
    value: "12",
    status: "Complete",
    icon: MapPin,
    color: "bg-primary",
    statusColor: "bg-primary/10 text-primary"
  },
  {
    id: 3,
    title: "Pending Reports",
    value: "3", 
    status: "Due",
    icon: FileText,
    color: "bg-orange-500",
    statusColor: "bg-orange-100 text-orange-700"
  },
  {
    id: 4,
    title: "Device Issues",
    value: "2",
    status: "Priority", 
    icon: AlertTriangle,
    color: "bg-destructive",
    statusColor: "bg-destructive/10 text-destructive"
  }
];

export const CHWStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                </div>
              </div>
              
              <div className="text-right space-y-1">
                {stat.change && (
                  <div className="flex items-center gap-1 text-primary text-sm font-medium">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </div>
                )}
                {stat.status && (
                  <Badge className={stat.statusColor}>
                    {stat.status}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};