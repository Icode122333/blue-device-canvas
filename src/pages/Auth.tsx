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
        
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              role: selectedRole
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isLogin ? "Sign In" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? "Enter your credentials to access your account" 
              : "Create a new account to get started"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLogin && (
            <div className="space-y-3">
              <Label>Select your role</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={selectedRole === 'chw' ? 'default' : 'outline'}
                  onClick={() => setSelectedRole('chw')}
                  className="h-20 flex-col gap-2"
                >
                  <Users className="h-6 w-6" />
                  <span className="text-xs">CHW</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === 'patient' ? 'default' : 'outline'}
                  onClick={() => setSelectedRole('patient')}
                  className="h-20 flex-col gap-2"
                >
                  <Heart className="h-6 w-6" />
                  <span className="text-xs">Patient</span>
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>

          <div className="text-center text-sm">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setIsLogin(false)}
                >
                  Sign up
                </Button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setIsLogin(true)}
                >
                  Sign in
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};