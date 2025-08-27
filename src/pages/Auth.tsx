import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Heart } from "lucide-react";

interface AuthProps {
  onRoleSelect: (role: 'chw' | 'patient') => void;
}

export const Auth = ({ onRoleSelect }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<'chw' | 'patient' | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
              username
            }
          }
        });
        if (error) throw error;
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account."
        });
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4 pt-20 pb-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-100/20 to-blue-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-lg mb-4 clay-card">
            <img
              src="/logo RBapp.png"
              alt="RB App Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600">Your health journey continues here</p>
        </div>

        <Card className="clay-card clay-fade-in backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900">
              {isLogin ? "Sign In" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {isLogin
                ? "Enter your credentials to access your account"
                : "Create a new account to get started"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-4">
                <Label className="text-slate-700 font-medium">Select your role</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('chw')}
                    className={`relative h-24 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 ${selectedRole === 'chw'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg scale-105'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-600'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedRole === 'chw' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                      <Users className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">CHW</span>
                    {selectedRole === 'chw' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('patient')}
                    className={`relative h-24 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 ${selectedRole === 'patient'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 text-slate-600'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedRole === 'patient' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                      <Heart className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">Patient</span>
                    {selectedRole === 'patient' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700 font-medium">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                    required
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 rounded-xl">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Loading...
                  </div>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center text-sm pt-6 border-t border-slate-100">
              {isLogin ? (
                <p className="text-slate-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-colors"
                    onClick={() => setIsLogin(false)}
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-slate-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-colors"
                    onClick={() => setIsLogin(true)}
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">
            Secure • Private • HIPAA Compliant
          </p>
        </div>
      </div>
    </div>
  );
};