import { useState, useEffect } from "react";
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/pages/Auth";
import { PatientOnboarding } from "@/components/PatientOnboarding";
import { CHWDashboard } from "@/components/CHWDashboard";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Navigation } from "@/components/Navigation";
import { InfoCard } from "@/components/InfoCard";
import { ExerciseList } from "@/components/ExerciseList";
import { AppointmentList } from "@/components/AppointmentList";

export const AppWrapper = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            setProfile(profileData);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
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

  // CHW Dashboard
  if (profile.role === 'chw') {
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
        </>
      )}
      {activeTab === "devices" && <ExerciseList />}
    </div>
  );
};