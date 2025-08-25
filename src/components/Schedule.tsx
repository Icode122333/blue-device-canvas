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
    <div className="px-4 pt-16 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">Schedule Appointment</h1>
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Previous Month" className="p-2 rounded-lg border hover:bg-muted" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium w-32 text-center">{format(currentMonth, "MMMM yyyy")}</span>
          <button aria-label="Next Month" className="p-2 rounded-lg border hover:bg-muted" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-card rounded-xl border p-4">
        <div className="grid grid-cols-7 text-xs text-muted-foreground mb-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: leadingEmptyDays }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}
          {monthDays.map((day) => {
            const selected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);
            return (
              <button
                key={day.toISOString()}
                className={`h-10 rounded-lg text-sm border transition-colors
                  ${selected ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}
                  ${today && !selected ? "border-primary/40" : "border-border"}
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
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border p-3">
          <label className="text-xs text-muted-foreground">Physiotherapist</label>
          <div className="mt-2 flex gap-2">
            {physiotherapists.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPhysio(p)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedPhysio === p ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}
              >
                <span className="inline-flex items-center gap-1"><User2 className="h-4 w-4" /> {p}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border p-3 sm:col-span-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4" /> Time</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {times.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedTime === t ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-4">
        <button
          disabled={!canSubmit}
          onClick={submit}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Booking..." : "Book Appointment"}
        </button>
        <p className="mt-2 text-xs text-muted-foreground">Appointments remain pending until approved by an admin.</p>
      </div>
    </div>
  );
};
