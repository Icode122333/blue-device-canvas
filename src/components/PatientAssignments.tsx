import { Users, MapPin, Clock, Calendar, Phone, MessageSquare, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import profileAvatar from "@/assets/profile-avatar.png";

const patients = [
  {
    id: 1,
    name: "Emma Johnson",
    age: 7,
    condition: "Spastic CP",
    distance: "2.3 km",
    lastVisit: "2 days ago",
    nextVisit: "Today",
    progress: 85,
    priority: "high",
    avatar: profileAvatar
  },
  {
    id: 2,
    name: "Michael Chen", 
    age: 12,
    condition: "Mild CP",
    distance: "1.8 km",
    lastVisit: "1 week ago", 
    nextVisit: "Tomorrow",
    progress: 72,
    priority: "medium",
    avatar: null
  }
];

export const PatientAssignments = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Patient Assignments</h2>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <ArrowRight className="h-4 w-4 mr-2" />
          Optimize Route
        </Button>
      </div>
      
      <div className="space-y-4">
        {patients.map((patient) => (
          <Card key={patient.id} className="p-4 border border-border hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  {patient.avatar ? (
                    <AvatarImage src={patient.avatar} alt={`${patient.name}'s profile`} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{patient.name}</h3>
                    {patient.priority === 'high' && (
                      <Badge className="bg-destructive/10 text-destructive text-xs">
                        high priority
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{patient.age} years • {patient.condition}</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{patient.distance}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Last: {patient.lastVisit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-primary font-medium">
                    <Calendar className="h-3 w-3" />
                    <span>Next: {patient.nextVisit}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{patient.progress}%</div>
                  <div className="text-xs text-muted-foreground">Progress</div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="p-2">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="p-2">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};