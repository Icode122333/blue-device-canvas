import { useState, useEffect } from "react";
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/pages/Auth";
import { PatientOnboarding } from "@/components/PatientOnboarding";
import { CHWDashboard } from "@/components/CHWDashboard";
import { CHWOnboarding } from "@/components/CHWOnboarding";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Navigation } from "@/components/Navigation";
import { InfoCard } from "@/components/InfoCard";
import { ExerciseList } from "@/components/ExerciseList";
import { AppointmentList } from "@/components/AppointmentList";
import { Community } from "@/components/Community";
import { Schedule } from "@/components/Schedule";
import { Navigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Calculator } from "lucide-react";

export const AppWrapper = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  const ensureProfile = async (u: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', u.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to load profile:', error);
      return null;
    }

    if (data) return data;

    const role = (u.user_metadata as any)?.role ?? 'patient';
    const username = (u.user_metadata as any)?.username?.trim?.() || null;
    const onboardingCompleted = role === 'physio';
    const { data: created, error: insertErr } = await supabase
      .from('profiles')
      .insert({ user_id: u.id, role, onboarding_completed: onboardingCompleted, username })
      .select('*')
      .single();
    if (insertErr) {
      console.error('Failed to create profile:', insertErr);
      return null;
    }
    return created;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(async () => {
            const profileData = await ensureProfile(session.user!);
            setProfile(profileData);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(async () => {
          const profileData = await ensureProfile(session.user!);
          setProfile(profileData);
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingComplete = async () => {
    if (user) {
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setProfile(updatedProfile);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0f291e] min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm p-8 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-500" />
          <p className="mt-4 text-sm text-emerald-100/60">Loading your recovery space...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Auth onRoleSelect={() => {}} />;
  }

  if (profile.role === 'patient' && !profile.onboarding_completed) {
    return <PatientOnboarding onComplete={handleOnboardingComplete} />;
  }

  if (profile.role === 'physio') {
    return <Navigate to="/admin" replace />;
  }

  if (profile.role === 'chw') {
    if (!profile.onboarding_completed) {
      return <CHWOnboarding onComplete={handleOnboardingComplete} />;
    }
    return <CHWDashboard />;
  }

  // ── Patient Dashboard ──
  return (
    <div className="bg-[#0f291e] min-h-screen pb-32">
      <ProfileHeader />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "home" && (
        <>
          {/* ── Resources Grid ── */}
          <div className="px-4 mt-5">
            {/* Section header — gold accent */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Resources</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-500/80">
                For you
              </span>
            </div>

            <div className="flex flex-col gap-3">

              {/* Top full-width card — Did you know */}
              <button className="relative w-full h-40 rounded-[1.4rem] overflow-hidden group text-left border border-emerald-800/40 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                <img
                  src="/did%20you%20know.jpg"
                  alt="Did you know"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* green gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f291e]/70 via-[#0f291e]/30 to-transparent" />
                {/* gold "NEW" badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500 text-xs font-bold text-emerald-950 shadow">
                    NEW
                  </span>
                </div>
                {/* label bottom-left */}
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center pl-4 pr-5 py-2.5 rounded-[0.9rem] bg-white/95 text-sm font-bold text-gray-900 shadow-md">
                    Did you know
                  </span>
                </div>
              </button>

              {/* Middle row — two half cards */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab("schedule")}
                  className="relative w-full h-44 rounded-[1.4rem] overflow-hidden group text-left border border-emerald-800/40 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
                >
                  <img
                    src="/appoinment.jpg"
                    alt="Schedule Appointment"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0f291e]/60 to-transparent" />
                  <div className="absolute bottom-4 left-3 right-3">
                    <span className="inline-flex items-center px-3 py-2 rounded-[0.9rem] bg-white/95 text-xs font-bold text-gray-900 shadow-md leading-snug w-full justify-center">
                      Schedule Appointment
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("exercises")}
                  className="relative w-full h-44 rounded-[1.4rem] overflow-hidden group text-left border border-emerald-800/40 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
                >
                  <img
                    src="/exercises%20for%20you.jpg"
                    alt="Exercises for you"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0f291e]/60 to-transparent" />
                  <div className="absolute bottom-4 left-3 right-3">
                    <span className="inline-flex items-center px-3 py-2 rounded-[0.9rem] bg-white/95 text-xs font-bold text-gray-900 shadow-md leading-snug w-full justify-center">
                      Exercises for you
                    </span>
                  </div>
                </button>
              </div>

              {/* Bottom full-width card — Community */}
              <button
                onClick={() => setActiveTab("community")}
                className="relative w-full h-40 rounded-[1.4rem] overflow-hidden group text-left border border-amber-500/30 shadow-[0_4px_24px_rgba(212,175,55,0.12)]"
              >
                <img
                  src="/community.jpg"
                  alt="Community for you"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f291e]/70 via-[#0f291e]/30 to-transparent" />
                {/* gold bottom label */}
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center pl-4 pr-5 py-2.5 rounded-[0.9rem] bg-amber-500 text-sm font-bold text-emerald-950 shadow-md">
                    Community for you
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="mx-4 my-6 h-px bg-emerald-800/40" />

          {/* ── Legacy sections ── */}
          <InfoCard />
          <AppointmentList />

          <div className="mt-4 space-y-4 px-4">
            {/* App Guide card */}
            <div className="rounded-[1.4rem] border border-emerald-800/50 bg-[#0b1f16] p-5 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">App Guide</p>
                  <p className="text-xs text-emerald-100/60 mt-0.5">Learn how to use the app step by step</p>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="shrink-0 inline-flex items-center px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-bold transition shadow">
                    Open Guide
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-[#0f291e] border border-emerald-800/50 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">How to use the app</DialogTitle>
                    <DialogDescription className="text-emerald-100/60">Follow these steps to get started</DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto space-y-4 text-sm text-emerald-100/70 pr-2">
                    <div className="bg-emerald-900/40 border border-emerald-700/50 text-emerald-100 rounded-xl p-4">
                      <p className="font-semibold text-amber-400 mb-2">Quick overview</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Home shows your summary and upcoming appointments.</li>
                        <li>Schedule lets you request a time with your physiotherapist.</li>
                        <li>Community helps you ask questions and get support.</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-2">Practical examples</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><span className="font-medium text-amber-400">Book an appointment:</span> Go to Schedule → pick a date and time → choose Flora or Mugisha → Book.</li>
                        <li><span className="font-medium text-amber-400">Join a video session:</span> When approved, your appointment will show a "Join Call" button.</li>
                        <li><span className="font-medium text-amber-400">Ask the community:</span> Open Community → post a question or browse tips.</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-2">Tips for success</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Pick a time that's in the future to avoid booking errors.</li>
                        <li>Allow notifications so you don't miss approvals or reminders.</li>
                        <li>Keep your profile updated so your care team can help faster.</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <img src="/step%201.jpg" alt="Step 1" className="rounded-xl border border-emerald-800/40 w-full" />
                      <img src="/step%202.jpg" alt="Step 2" className="rounded-xl border border-emerald-800/40 w-full" />
                      <img src="/step%203.jpg" alt="Step 3" className="rounded-xl border border-emerald-800/40 w-full" />
                      <img src="/step%204.jpg" alt="Step 4" className="rounded-xl border border-emerald-800/40 w-full" />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* BMI Calculator card */}
            <Link to="/bmi" className="block">
              <div className="rounded-[1.4rem] border border-emerald-800/50 bg-[#0b1f16] p-5 flex items-center justify-between gap-4 shadow-sm hover:border-amber-500/40 transition">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">BMI Calculator</p>
                    <p className="text-xs text-emerald-100/60 mt-0.5">Check your Body Mass Index</p>
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-bold transition shadow">
                  Open
                </span>
              </div>
            </Link>
          </div>
        </>
      )}

      {activeTab === "exercises" && <ExerciseList />}
      {activeTab === "schedule" && <Schedule />}
      {activeTab === "community" && <Community />}
    </div>
  );
};
