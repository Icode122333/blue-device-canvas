import { useEffect, useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isSameDay, isToday, startOfMonth, subMonths } from "date-fns";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, User2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const physiotherapists = ["Flora", "Mugisha"] as const;
const times = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30",
  "15:00", "15:30", "16:00"
];

export const Schedule = () => {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedPhysio, setSelectedPhysio] = useState<typeof physiotherapists[number]>("Flora");
  const [submitting, setSubmitting] = useState(false);

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const leadingEmptyDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    // getDay: 0=Sunday ... 6=Saturday. We'll start week on Sun.
    return getDay(start);
  }, [currentMonth]);

  const canSubmit = selectedDate && selectedTime && selectedPhysio && !submitting;

  const submit = async () => {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id;
      if (!userId) {
        toast({ title: "Not signed in", description: "Please sign in to book an appointment.", variant: "destructive" });
        setSubmitting(false);
        return;
      }

      // Combine date and time into a TZ-aware timestamp. Assume local timezone; Supabase expects UTC.
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledLocal = new Date(selectedDate);
      scheduledLocal.setHours(hours, minutes, 0, 0);
      const scheduledISO = scheduledLocal.toISOString();

      const { error } = await supabase
        .from("appointments")
        .insert({
          user_id: userId,
          physiotherapist: selectedPhysio,
          scheduled_at: scheduledISO,
          status: "pending",
        });

      if (error) throw error;

      toast({ title: "Appointment requested", description: "Your appointment is pending admin approval." });
      // Reset selection
      setSelectedDate(null);
      setSelectedTime("");
      setSelectedPhysio("Flora");
    } catch (e: any) {
      toast({ title: "Booking failed", description: e.message ?? "Unable to book appointment.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-16 pb-28 bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Schedule Appointment</h1>
            <p className="text-sm text-muted-foreground">Book your next session</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-card rounded-xl p-2 shadow-soft border">
          <button 
            aria-label="Previous Month" 
            className="p-2 rounded-lg hover:bg-accent/50 transition-colors" 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold w-32 text-center px-2">{format(currentMonth, "MMMM yyyy")}</span>
          <button 
            aria-label="Next Month" 
            className="p-2 rounded-lg hover:bg-accent/50 transition-colors" 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-card rounded-2xl border shadow-soft p-6 mb-6">
        <div className="grid grid-cols-7 text-sm font-medium text-muted-foreground mb-4">
          <div className="text-center">Sun</div>
          <div className="text-center">Mon</div>
          <div className="text-center">Tue</div>
          <div className="text-center">Wed</div>
          <div className="text-center">Thu</div>
          <div className="text-center">Fri</div>
          <div className="text-center">Sat</div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: leadingEmptyDays }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12" />
          ))}
          {monthDays.map((day) => {
            const selected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);
            return (
              <button
                key={day.toISOString()}
                className={`h-12 rounded-xl text-sm font-medium transition-all transform hover:scale-105
                  ${selected ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-medium" : "bg-background hover:bg-accent/50 border border-border hover:border-primary/30"}
                  ${today && !selected ? "border-2 border-primary/60 bg-primary/5" : ""}
                `}
                onClick={() => setSelectedDate(day)}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector Row */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-card rounded-2xl border shadow-soft p-4">
          <label className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <User2 className="h-4 w-4 text-primary" />
            Choose Physiotherapist
          </label>
          <div className="flex gap-3">
            {physiotherapists.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPhysio(p)}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                  selectedPhysio === p 
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-medium" 
                    : "bg-accent/30 hover:bg-accent/50 text-foreground border border-accent/50"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <User2 className="h-4 w-4" /> 
                  {p}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-card rounded-2xl border shadow-soft p-4">
          <label className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> 
            Select Time
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {times.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                  selectedTime === t 
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-medium" 
                    : "bg-accent/30 hover:bg-accent/50 text-foreground border border-accent/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="bg-card rounded-2xl border shadow-soft p-4">
        <button
          disabled={!canSubmit}
          onClick={submit}
          className={`w-full py-4 rounded-xl font-semibold text-sm transition-all transform ${
            canSubmit 
              ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-medium hover:scale-105 active:scale-95" 
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {submitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              Booking...
            </div>
          ) : (
            "Book Appointment"
          )}
        </button>
        <p className="mt-3 text-xs text-center text-muted-foreground bg-accent/20 rounded-lg p-2">
          💡 Appointments remain pending until approved by an admin
        </p>
      </div>
    </div>
  );
};
