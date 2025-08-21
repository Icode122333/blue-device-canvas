import { Calendar, Video } from "lucide-react";

export const AppointmentList = () => {
  return (
    <div className="p-4 bg-muted/30 mx-4 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
      </div>
      
      <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
        <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center">
          <span className="text-sm font-medium">SM</span>
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-card-foreground">Physiotherapy Session</h3>
          <p className="text-sm text-muted-foreground">Dr. Sarah Mitchell</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-muted-foreground">Tomorrow at 10:00 AM</span>
            <span className="text-sm text-muted-foreground">City Medical Center</span>
          </div>
        </div>
        
        <button className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Video className="h-4 w-4" />
          Join Call
        </button>
      </div>
    </div>
  );
};