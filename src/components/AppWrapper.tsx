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
    // Try fetch existing profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', u.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') { // not "no rows"
      console.error('Failed to load profile:', error);
      return null;
    }

    if (data) return data;

    // Create a minimal profile if missing
    const role = (u.user_metadata as any)?.role ?? 'patient';
    const username = (u.user_metadata as any)?.username?.trim?.() || null;
    // Only physio is considered fully onboarded by default; CHW and patient must complete onboarding
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch or create user profile
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

    // Check for existing session
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show auth page
  if (!user || !profile) {
    return <Auth onRoleSelect={() => {}} />;
  }

  // Patient needs onboarding
  if (profile.role === 'patient' && !profile.onboarding_completed) {
    return <PatientOnboarding onComplete={handleOnboardingComplete} />;
  }

  // Physio - redirect to admin panel
  if (profile.role === 'physio') {
    return <Navigate to="/admin" replace />;
  }

  // CHW: require onboarding before dashboard
  if (profile.role === 'chw') {
    if (!profile.onboarding_completed) {
      return <CHWOnboarding onComplete={handleOnboardingComplete} />;
    }
    return <CHWDashboard />;
  }

  // Patient Dashboard
  return (
    <div className="min-h-screen bg-secondary/20 pb-28">
      <ProfileHeader />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "home" && (
        <>
          <InfoCard />
          <AppointmentList />

          <div className="mt-4 space-y-4 px-4">
            <Card className="clay-card clay-fade-in hover:scale-[1.01] transition">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    App Guide
                  </CardTitle>
                  <CardDescription>Learn how to use the app step by step</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="inline-flex items-center px-3 py-2 rounded-lg bg-primary text-white shadow hover:shadow-lg transition">
                      Open Guide
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>How to use the app</DialogTitle>
                      <DialogDescription>Follow these steps to get started</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto space-y-4 text-sm text-muted-foreground pr-2">
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-3">
                        <p className="font-medium text-emerald-900">Quick overview</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Home shows your summary and upcoming appointments.</li>
                          <li>Schedule lets you request a time with your physiotherapist.</li>
                          <li>Community helps you ask questions and get support.</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium text-card-foreground">Practical examples</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li><span className="font-medium">Book an appointment:</span> Go to Schedule → pick a date and time → choose Flora or Mugisha → Book. You’ll see the request as “pending” until approved.</li>
                          <li><span className="font-medium">Join a video session:</span> When approved, your appointment will show a “Join Call” button shortly before the session starts.</li>
                          <li><span className="font-medium">Ask the community:</span> Open Community → post a question or browse tips from others.</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium text-card-foreground">Tips for success</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Pick a time that’s in the future to avoid booking errors.</li>
                          <li>Allow notifications so you don’t miss approvals or reminders.</li>
                          <li>Keep your profile updated so your care team can help faster.</li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <img src="/step%201.jpg" alt="Step 1" className="rounded-xl border w-full" />
                        <img src="/step%202.jpg" alt="Step 2" className="rounded-xl border w-full" />
                        <img src="/step%203.jpg" alt="Step 3" className="rounded-xl border w-full" />
                        <img src="/step%204.jpg" alt="Step 4" className="rounded-xl border w-full" />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
            </Card>

            <Link to="/bmi" className="block">
              <Card className="clay-card clay-fade-in hover:scale-[1.01] transition">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      BMI Calculator
                    </CardTitle>
                    <CardDescription>Check your Body Mass Index</CardDescription>
                  </div>
                  <button className="inline-flex items-center px-3 py-2 rounded-lg bg-emerald-500 text-white shadow hover:shadow-lg transition">
                    Open
                  </button>
                </CardHeader>
              </Card>
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