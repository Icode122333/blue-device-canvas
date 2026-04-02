import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Clock, User2, CalendarDays, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";

const physiotherapists = ["Flora", "Mugisha"] as const;
const times = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30",
  "15:00", "15:30", "16:00",
];

export const Schedule = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedPhysio, setSelectedPhysio] = useState<typeof physiotherapists[number]>("Flora");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = selectedDate && selectedTime && selectedPhysio && !submitting;

  const isPastSelectedTime = useMemo(() => (t: string) => {
    if (!selectedDate) return false;
    const [h, m] = t.split(":").map(Number);
    const candidate = new Date(selectedDate);
    candidate.setHours(h, m, 0, 0);
    const now = new Date(Date.now() + 60 * 1000);
    return candidate <= now;
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate && selectedTime && isPastSelectedTime(selectedTime)) {
      setSelectedTime("");
    }
  }, [selectedDate, selectedTime, isPastSelectedTime]);

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

      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledLocal = new Date(selectedDate);
      scheduledLocal.setHours(hours, minutes, 0, 0);
      if (scheduledLocal <= new Date()) {
        toast({ title: "Pick a future time", description: "Please choose a time later than now.", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      const scheduledISO = scheduledLocal.toISOString();

      const { error } = await supabase.from("appointments").insert({
        user_id: userId,
        physiotherapist: selectedPhysio,
        scheduled_at: scheduledISO,
        status: "pending",
      });

      if (error) throw error;

      toast({ title: "Appointment requested", description: "Your appointment is pending admin approval." });
      setSelectedTime("");
      setSelectedPhysio("Flora");
    } catch (e: any) {
      toast({ title: "Booking failed", description: e.message ?? "Unable to book appointment.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pb-32 pt-6">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-tight">Schedule</h1>
          <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-none border-amber-500/20">
            2 Specialists
          </Badge>
        </div>
        <p className="text-sm text-emerald-100/60">
          Book your next session. Requests remain pending until confirmed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calendar */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-[1.8rem] border border-emerald-800/40 bg-[#0b1f16] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <CalendarDays className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Select Date</h2>
              </div>
            </div>
            
            <div className="flex justify-center bg-[#0f291e] rounded-2xl p-2 border border-emerald-800/20">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={{ before: new Date() }}
                className="text-white"
                classNames={{
                  day_selected: "bg-amber-500 text-emerald-950 font-bold hover:bg-amber-500 hover:text-emerald-950 focus:bg-amber-500 focus:text-emerald-950 shadow-md",
                  day_today: "bg-emerald-800/50 text-white font-bold",
                  day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-emerald-800/50 rounded-xl transition-colors",
                  head_cell: "text-emerald-100/40 font-semibold w-10 tracking-widest text-[0.7rem] uppercase",
                  nav_button: "h-8 w-8 hover:bg-emerald-800/50 hover:text-white rounded-lg transition-colors border border-emerald-800/40",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  caption: "flex justify-center pt-1 relative items-center mb-4",
                  caption_label: "text-sm font-bold tracking-wider",
                }}
              />
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-emerald-800/40 bg-[#0b1f16] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
             <div className="flex items-center gap-2 mb-4 px-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <User2 className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Therapist</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {physiotherapists.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPhysio(p)}
                  className={`relative flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                    selectedPhysio === p 
                      ? "bg-emerald-900/60 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500" 
                      : "bg-[#0f291e] border-emerald-800/30 text-emerald-100/60 hover:bg-emerald-900/30 hover:border-emerald-700/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {p}
                  </span>
                  {selectedPhysio === p && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Time Picker & Checkout */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[1.8rem] border border-emerald-800/40 bg-[#0b1f16] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex-1">
             <div className="flex items-center gap-2 mb-4 px-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Clock className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Available Time</h2>
            </div>

            <div className="grid grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {times.map((t) => {
                const disabled = isPastSelectedTime(t);
                const isSelected = selectedTime === t;
                return (
                  <button
                    key={t}
                    onClick={() => !disabled && setSelectedTime(t)}
                    disabled={disabled}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                      disabled
                        ? "opacity-30 cursor-not-allowed bg-[#0f291e] border-emerald-900 text-emerald-100/30"
                        : isSelected
                          ? "bg-amber-500 text-emerald-950 border-amber-500 shadow-md scale-105"
                          : "bg-[#0f291e] border-emerald-800/30 text-emerald-100/80 hover:border-amber-500/40 hover:text-amber-400"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sticky Submit Bar / Card */}
          <div className="rounded-[1.8rem] border border-amber-500/20 bg-gradient-to-b from-[#0b1f16] to-[#0f291e] p-5 shadow-[0_8px_32px_rgba(245,158,11,0.05)]">
            <div className="mb-4 space-y-1">
              <p className="text-xs text-emerald-100/50 uppercase tracking-widest font-semibold">Summary</p>
              <div className="flex justify-between items-baseline">
                <p className="text-white font-medium">
                  {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select date"}
                </p>
                <p className="text-amber-500 font-bold">
                  {selectedTime || "Select time"}
                </p>
              </div>
            </div>
            
            <button
              disabled={!canSubmit}
              onClick={submit}
              className="relative w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-emerald-950 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-emerald-900 disabled:text-emerald-100 hover:bg-amber-400 focus:ring-2 focus:ring-amber-500/50 shadow-[0_4px_16px_rgba(245,158,11,0.2)] active:scale-[0.98]"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-950/20 border-t-emerald-950" />
                  Booking...
                </span>
              ) : (
                "Confirm Appointment"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
