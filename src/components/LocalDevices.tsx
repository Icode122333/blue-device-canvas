import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, MapPin, Star, Clock } from "lucide-react";

export const LocalDevices = () => {
  const devices = [
    {
      id: 1,
      name: "Mobility Walker Pro",
      category: "Mobility Aid",
      distance: "0.8 km",
      rating: 4.8,
      available: true,
      provider: "MedEquip Rwanda"
    },
    {
      id: 2,
      name: "Therapy Ball Set",
      category: "Exercise Equipment",
      distance: "1.2 km",
      rating: 4.9,
      available: true,
      provider: "PhysioSupply"
    },
    {
      id: 3,
      name: "Standing Frame",
      category: "Support Device",
      distance: "2.1 km",
      rating: 4.7,
      available: false,
      provider: "HealthTech Hub"
    }
  ];

  return (
    <Card className="mx-4 mb-4 bg-gradient-to-r from-accent/20 to-secondary/30 border-accent/20 shadow-soft">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Local Devices</h2>
        </div>
        <div className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center gap-3 p-3 bg-background/80 rounded-lg border border-accent/20 hover:bg-background/90 transition-colors cursor-pointer group"
            >
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground text-sm">{device.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    device.available 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {device.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{device.category}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{device.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-primary" />
                    <span>{device.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-primary font-medium mt-1">{device.provider}</p>
              </div>
              <Clock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};