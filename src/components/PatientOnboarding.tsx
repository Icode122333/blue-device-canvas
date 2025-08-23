import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";

interface PatientOnboardingProps {
  onComplete: () => void;
}

export const PatientOnboarding = ({ onComplete }: PatientOnboardingProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    motherPhone: "",
    problemFirstNoticed: ""
  });
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not found");

      // Save patient onboarding data
      const { error: onboardingError } = await supabase
        .from('patient_onboarding')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          age: parseInt(formData.age),
          mother_phone: formData.motherPhone,
          problem_first_noticed: formData.problemFirstNoticed
        });

      if (onboardingError) throw onboardingError;

      // Update profile to mark onboarding as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          avatar_url: avatarUrl || null
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({ title: "Welcome! Your profile has been set up successfully." });
      onComplete();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Patient!</CardTitle>
          <CardDescription>
            Please provide some basic information to complete your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-medium">Profile Photo</h3>
              <ImageUpload 
                currentImageUrl={avatarUrl}
                onImageUploaded={setAvatarUrl}
                size="lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Enter your age"
                min="1"
                max="120"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherPhone">Mother's Phone Number</Label>
              <Input
                id="motherPhone"
                type="tel"
                value={formData.motherPhone}
                onChange={(e) => handleInputChange('motherPhone', e.target.value)}
                placeholder="Enter mother's phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="problemFirstNoticed">When was the problem first noticed?</Label>
              <Input
                id="problemFirstNoticed"
                type="date"
                value={formData.problemFirstNoticed}
                onChange={(e) => handleInputChange('problemFirstNoticed', e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};