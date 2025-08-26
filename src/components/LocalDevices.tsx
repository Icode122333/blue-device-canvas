import { MapPin, Clock, Star, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const devices = [
  {
    id: 1,
    name: "Kigali Rehabilitation Center",
    distance: "0.8 km",
    rating: 4.8,
    equipment: ["Physiotherapy", "Wheelchairs", "Walking Aids"],
    hours: "8:00 AM - 6:00 PM",
    status: "Open"
  },
  {
    id: 2,
    name: "Rwanda Physiotherapy Clinic", 
    distance: "1.2 km",
    rating: 4.6,
    equipment: ["Exercise Equipment", "Mobility Devices"],
    hours: "9:00 AM - 5:00 PM", 
    status: "Open"
  },
  {
    id: 3,
    name: "Community Health Center",
    distance: "2.1 km",
    rating: 4.4,
    equipment: ["Basic Equipment", "Support Groups"],
    hours: "7:00 AM - 7:00 PM",
    status: "Closed"
  }
];

export const LocalDevices = () => {
  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Nearby Centers</h2>
        <button className="text-primary text-sm font-medium hover:text-primary-dark transition-colors">
          View Map
        </button>
      </div>

      <div className="space-y-3">
        {devices.map((device, index) => (
          <Card 
            key={device.id}
            className="hover-lift cursor-pointer border-0 bg-gradient-to-br from-white to-secondary shadow-sm hover:shadow-medium transition-all duration-300"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">
                    {device.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {device.distance}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      {device.rating}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <Clock className="h-3 w-3" />
                    {device.hours}
                  </div>
                </div>
                <Badge 
                  variant={device.status === "Open" ? "default" : "secondary"}
                  className={device.status === "Open" ? "bg-primary text-primary-foreground" : ""}
                >
                  {device.status}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {device.equipment.map((item, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="text-xs bg-pale-green border-primary/20"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-0 bg-gradient-to-br from-pale-blue to-accent">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">
                Emergency Support
              </h3>
              <p className="text-sm text-muted-foreground">
                24/7 helpline: +250 788 123 456
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};