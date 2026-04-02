import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  ChevronLeft,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Zap,
} from "lucide-react";

interface AuthProps {
  onRoleSelect: (role: "chw" | "patient") => void;
}

type IntroView = "splash" | "features" | "auth";

const INTRO_STORAGE_KEY = "rbapp-auth-intro-seen";


const authHighlights = [
  "Book rehab appointments without leaving the app.",
  "Upload reports and follow progress from one dashboard.",
  "Keep patients and caregivers aligned on the next step.",
];

export const Auth = ({ onRoleSelect }: AuthProps) => {
  const [introView, setIntroView] = useState<IntroView>("splash");
  const [featureIndex, setFeatureIndex] = useState(0);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"chw" | "patient" | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const hasSeenIntro = window.localStorage.getItem(INTRO_STORAGE_KEY) === "true";
    if (hasSeenIntro) {
      setIntroView("auth");
      return;
    }

    const timer = window.setTimeout(() => {
      setIntroView("features");
    }, 1500);

    return () => window.clearTimeout(timer);
  }, []);

  const completeIntro = () => {
    window.localStorage.setItem(INTRO_STORAGE_KEY, "true");
    setIntroView("auth");
  };

  const handleRoleSelect = (role: "chw" | "patient") => {
    setSelectedRole(role);
    onRoleSelect(role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({ title: "Signed in successfully!" });
      } else {
        if (!selectedRole) {
          setError("Please select your role before signing up");
          return;
        }

        if (!username.trim()) {
          setError("Please choose a username");
          return;
        }

        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              role: selectedRole,
              username,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (introView === "splash") {
    return (
      <div className="screen-shell min-h-screen overflow-hidden px-6 py-10">
        <div className="app-grid absolute inset-0 opacity-50" />
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
          <div className="panel-soft relative w-full max-w-md overflow-hidden px-8 py-16 text-center">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,hsl(79_100%_62%_/_0.24),transparent_70%)]" />
            <div className="relative space-y-6">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-primary/30 bg-primary shadow-[0_24px_60px_hsl(79_100%_62%_/_0.22)] overflow-hidden">
                <img src="/rblogo.jpeg" alt="Rise Better Logo" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary/80">
                  Rise Better
                </p>
                <h1 className="text-4xl font-bold text-white sm:text-5xl">
                  Rehab care,
                  <br />
                  redesigned.
                </h1>
                <p className="mx-auto max-w-xs text-sm leading-6 text-muted-foreground">
                  A calmer mobile experience for patients, caregivers, CHWs, and physiotherapists.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="h-2.5 w-10 rounded-full bg-primary" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (introView === "features") {
    const screens = [
      {
        title: "Rise Better",
        desc: "Unlock the full power of your recovery data.",
      },
      {
        title: "Guidance you can trust",
        desc: "Achieve your goals with daily missions designed with physiotherapists.",
      },
      {
        title: "You're in control",
        desc: "Share a Health Report with your care team. Control what data you share.",
      }
    ];

    const current = screens[featureIndex];

    return (
      <div className="min-h-[100dvh] bg-white text-black flex flex-col font-sans">
        <div className="flex-1 overflow-y-auto flex flex-col pt-12 pb-8 px-6">
          <div className="flex-1 w-full max-w-md mx-auto flex flex-col items-center justify-center">
            {featureIndex === 0 && (
              <div className="w-full aspect-[4/3] relative mb-10 rounded-[1.75rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-[#f8f9fa] flex items-center justify-center p-4 border border-black/5">
                <img src="/screen1_hero.png" alt="Devices" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
            )}
            
            {featureIndex === 1 && (
              <div className="w-full grid grid-cols-2 gap-3 mb-10 h-[380px]">
                <div className="col-span-1 h-[180px] rounded-[1.5rem] overflow-hidden bg-[#f0f2f5]">
                   <img src="/screen2_workout.png" alt="Workout" className="w-full h-full object-cover" />
                </div>
                <div className="col-span-1 h-[180px] rounded-[1.5rem] overflow-hidden bg-[#e8f3ee]">
                   <img src="/screen2_ui_food.png" alt="UI" className="w-full h-full object-contain p-2" />
                </div>
                <div className="col-span-2 h-[180px] rounded-[1.5rem] overflow-hidden bg-[#f5f4f0] flex items-center justify-center">
                   <img src="/screen2_cards.png" alt="Cards" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {featureIndex === 2 && (
              <div className="w-full grid grid-cols-2 gap-3 mb-10 h-[380px]">
                <div className="col-span-2 h-[180px] rounded-[1.5rem] overflow-hidden bg-[#f8f9fa]">
                   <img src="/screen3_relaxing.png" alt="Relaxing" className="w-full h-full object-cover" />
                </div>
                <div className="col-span-1 h-[180px] rounded-[1.5rem] overflow-hidden bg-[#f5f6f8] p-2 flex items-center justify-center">
                   <img src="/screen3_chart.png" alt="Chart" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="col-span-1 h-[180px] rounded-[1.5rem] overflow-hidden bg-[#f5f6f8] p-2 flex items-center justify-center">
                   <img src="/screen3_apps.png" alt="Apps" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              </div>
            )}

            <div className="text-center w-full px-2 mt-auto">
              <h2 className="text-[28px] leading-tight font-bold tracking-tight text-gray-900 mb-3">{current.title}</h2>
              <p className="text-[15px] leading-relaxed text-[#6b7280] font-normal max-w-[280px] mx-auto">
                {current.desc}
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 mt-10 mb-8">
              {screens.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-[5px] rounded-full transition-all duration-300 ${
                    featureIndex === idx ? "w-4 bg-gray-900" : "w-[5px] bg-gray-300"
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => {
                if (featureIndex === screens.length - 1) {
                  completeIntro();
                } else {
                  setFeatureIndex(prev => prev + 1);
                }
              }}
              className="w-full bg-[#0f0f0f] hover:bg-black text-white text-[15px] font-medium py-4 rounded-[1.125rem] transition-all active:scale-[0.98]"
            >
              Get started
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen overflow-hidden px-4 py-5 sm:px-6 sm:py-8 flex items-center">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-md items-center justify-center relative z-10">
        <Card className="w-full overflow-hidden border-emerald-900/50 bg-[#0f291e] shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-6">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-amber-500/25 bg-amber-500/10 shadow-[0_18px_42px_rgba(212,175,55,0.15)] overflow-hidden">
                  <img src="/rblogo.jpeg" alt="Rise Better Logo" className="h-full w-full object-cover" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.32em] text-amber-500/75">
                    Rise Better
                  </p>
                  <h2 className="text-3xl font-bold text-white">
                    {isLogin ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="text-sm leading-6 text-emerald-100/70">
                    {isLogin
                      ? "Sign in to continue your recovery or care workflow."
                      : "Choose your role and set up your account to get started."}
                  </p>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-4 rounded-[1.75rem] border border-white/5 bg-black/20 p-4 sm:p-5">
                  <div>
                    <p className="text-sm font-semibold text-white">Choose your role</p>
                    <p className="mt-1 text-xs text-emerald-100/60">
                      This keeps onboarding and dashboard views aligned with your workflow.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        role: "chw" as const,
                        title: "CHW",
                        copy: "Care coordination, reports, and assignments.",
                        icon: Users,
                      },
                      {
                        role: "patient" as const,
                        title: "Patient",
                        copy: "Appointments, exercises, and tracking.",
                        icon: HeartPulse,
                      },
                    ].map((roleCard) => {
                      const active = selectedRole === roleCard.role;
                      const Icon = roleCard.icon;
                      return (
                        <button
                          key={roleCard.role}
                          type="button"
                          onClick={() => handleRoleSelect(roleCard.role)}
                          className={`rounded-[1.5rem] border p-4 text-left transition-all ${
                            active
                              ? "border-amber-400 bg-amber-400/10 shadow-[0_8px_20px_rgba(212,175,55,0.08)]"
                              : "border-white/5 bg-black/20 hover:border-amber-400/30 hover:bg-white/5"
                          }`}
                        >
                          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${active ? "bg-amber-400/20 text-amber-400" : "bg-white/10 text-white"}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className="mt-4 text-base font-semibold text-white">{roleCard.title}</p>
                          <p className="mt-2 text-xs leading-5 text-emerald-100/60">{roleCard.copy}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-emerald-50">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-amber-500/50"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a public username"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-emerald-50">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-amber-500/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-emerald-50">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-amber-500/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-950/50 border-red-900/50 text-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold" 
                  disabled={loading}
                >
                  {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                </Button>
              </form>

              <div className="rounded-[1.5rem] border border-white/5 bg-black/20 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {isLogin ? "Need a new account?" : "Already registered?"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    onClick={() => {
                      setIsLogin((value) => !value);
                      setError(null);
                    }}
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
