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
      <div
        className="min-h-[100dvh] bg-emerald-900 flex flex-col items-center justify-center cursor-pointer"
        onClick={() => setIntroView("features")}
      >
        <div className="animate-in fade-in zoom-in duration-700 flex flex-col items-center gap-6">
          <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.35)] border-4 border-amber-500/40">
            <img src="/rblogo.jpeg" alt="RBapp Logo" className="w-full h-full object-cover" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">RBapp</h1>
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-[0.3em]">Rise Better</p>
          </div>
          <p className="text-white/40 text-xs mt-8 animate-pulse">Tap to continue</p>
        </div>
      </div>
    );
  }

  if (introView === "features") {
    const screens = [
      {
        title: "Care Beyond the Hospital",
        desc: "Continue rehabilitation at home with guided support designed for caregivers and families.",
        image: "/incusion 2.png",
      },
      {
        title: "Personalized Support",
        desc: "Receive tailored rehabilitation plans, progress tracking, and simple daily guidance.",
        image: "/peronalize care.png",
      },
      {
        title: "Connected Care",
        desc: "Stay connected with physiotherapists, community support, and essential assistive resources.",
        image: "/connected-care.jpg",
      }
    ];

    const current = screens[featureIndex];

    return (
      <div className="min-h-[100dvh] bg-emerald-900 text-white flex flex-col font-sans">
        <div className="flex-1 overflow-y-auto flex flex-col pt-10 pb-8 px-6">
          <div className="flex-1 w-full max-w-md mx-auto flex flex-col items-center justify-center">
            <div className="w-full aspect-[4/3] relative mb-10 rounded-[1.75rem] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.3)] bg-emerald-800 flex items-center justify-center border-2 border-amber-500/20">
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center w-full px-2 mt-auto">
              <h2 className="text-[28px] leading-tight font-bold tracking-tight text-amber-400 mb-3">{current.title}</h2>
              <p className="text-[15px] leading-relaxed text-white/70 font-normal max-w-[280px] mx-auto">
                {current.desc}
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 mt-10 mb-8">
              {screens.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-[5px] rounded-full transition-all duration-300 ${
                    featureIndex === idx ? "w-4 bg-amber-500" : "w-[5px] bg-white/30"
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
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-amber-400 text-[15px] font-bold py-4 rounded-[1.125rem] transition-all active:scale-[0.98] shadow-lg"
            >
              {featureIndex === screens.length - 1 ? "Get Started" : "Next"}
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
