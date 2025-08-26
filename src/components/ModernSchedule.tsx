import { useState } from "react";
import { Calendar, Clock, Users, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const appointments = [
  {
    id: 1,
    title: "Physiotherapy Session",
    time: "10:00 AM",
    duration: "45 min",
    type: "therapy",
    status: "confirmed"
  },
  {
    id: 2,
    title: "Doctor Consultation",
    time: "2:30 PM", 
    duration: "30 min",
    type: "consultation",
    status: "pending"
  },
  {
    id: 3,
    title: "Group Exercise Class",
    time: "4:00 PM",
    duration: "60 min", 
    type: "group",
    status: "confirmed"
  }
];

const weekDays = [
  { day: "Mon", date: "18", isToday: false },
  { day: "Tue", date: "19", isToday: false },
  { day: "Wed", date: "20", isToday: true },
  { day: "Thu", date: "21", isToday: false },
  { day: "Fri", date: "22", isToday: false },
  { day: "Sat", date: "23", isToday: false },
  { day: "Sun", date: "24", isToday: false }
];

export const ModernSchedule = () => {
  const [selectedWeek, setSelectedWeek] = useState(0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "therapy": return "bg-primary text-primary-foreground";
      case "consultation": return "bg-pale-blue text-accent-foreground";
      case "group": return "bg-pale-green text-pale-green-foreground";
      default: return "bg-secondary";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "confirmed" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground";
  };

  return (
    <div className="p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Schedule</h1>
          <p className="text-sm text-muted-foreground">Manage your appointments and sessions</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-xl shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Book
        </Button>
      </div>

      {/* Week Navigation */}
      <Card className="mb-6 border-0 bg-gradient-to-r from-white to-secondary shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-foreground">March 2024</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className={`text-center py-2 px-1 rounded-xl cursor-pointer transition-all duration-200 ${
                  day.isToday 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-pale-green"
                }`}
              >
                <div className="text-xs font-medium mb-1">{day.day}</div>
                <div className="text-lg font-semibold">{day.date}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Today's Schedule
        </h2>
        
        <div className="space-y-3">
          {appointments.map((appointment, index) => (
            <Card 
              key={appointment.id}
              className="hover-lift cursor-pointer border-0 bg-gradient-to-br from-white to-secondary shadow-sm hover:shadow-medium transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(appointment.type)}>
                        {appointment.type}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    
                    <h3 className="font-medium text-foreground mb-1">
                      {appointment.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appointment.time}
                      </div>
                      <div>{appointment.duration}</div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 bg-gradient-to-br from-pale-green to-accent">
        <CardContent className="p-4">
          <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="bg-white/80 border-primary/20 hover:bg-white hover:scale-105 transition-transform"
            >
              Reschedule
            </Button>
            <Button 
              variant="outline"
              className="bg-white/80 border-primary/20 hover:bg-white hover:scale-105 transition-transform"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};