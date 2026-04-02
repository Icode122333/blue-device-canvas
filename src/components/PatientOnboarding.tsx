import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { ArrowLeft, ArrowRight, CalendarClock, HeartPulse, Phone, UserRound } from "lucide-react";

interface PatientOnboardingProps {
  onComplete: () => void;
}

const patientSteps = [
  "Identity",
  "Support contact",
  "Recovery timeline",
];

export const PatientOnboarding = ({ onComplete }: PatientOnboardingProps) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    motherPhone: "",
    problemFirstNoticed: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canAdvance = useMemo(() => {
    if (step === 0) return formData.fullName.trim().length > 0;
    if (step === 1) return formData.age.trim().length > 0 && formData.motherPhone.trim().length > 0;
    if (step === 2) return formData.problemFirstNoticed.trim().length > 0;
    return false;
  }, [formData, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not found");

      const { error: onboardingError } = await supabase.from("patient_onboarding").insert({
        user_id: user.id,
        full_name: formData.fullName,
        age: parseInt(formData.age, 10),
        mother_phone: formData.motherPhone,
        problem_first_noticed: formData.problemFirstNoticed,
      });

      if (onboardingError) throw onboardingError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          avatar_url: avatarUrl || null,
        })
        .eq("user_id", user.id);

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
    <div className="bg-[#FAFAFA] min-h-screen overflow-hidden px-4 py-5 sm:px-6 sm:py-8 flex items-center">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-md w-full flex-col justify-center relative z-10">
        
        <div className="w-full mb-8">
          <div className="h-2 w-full bg-emerald-900/10 rounded-full overflow-hidden">
             <div 
               className="h-full bg-amber-500 transition-all duration-500 ease-in-out rounded-full" 
               style={{ width: `${((step + 1) / patientSteps.length) * 100}%` }} 
             />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-900/50 mt-4 text-center font-bold">
            Step {step + 1} of {patientSteps.length}
          </p>
        </div>

        <Card className="w-full overflow-hidden border-emerald-900/50 bg-[#0f291e] shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold text-white">{patientSteps[step]}</h2>
                <p className="text-sm leading-6 text-emerald-100/70">
                  {step === 0 && "Start with the basics so your account feels personal from the first screen."}
                  {step === 1 && "Add the support contact information needed for patient follow-up."}
                  {step === 2 && "Tell us when the problem was first noticed before completing setup."}
                </p>
              </div>

              {step === 0 && (
                <div className="space-y-5">
                  <div className="rounded-[1.75rem] border border-white/5 bg-black/20 p-5 flex justify-center">
                    <ImageUpload currentImageUrl={avatarUrl} onImageUploaded={setAvatarUrl} size="lg" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-emerald-50">
                      Full name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-amber-500/50"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-medium text-emerald-50">
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="Age"
                      min="1"
                      max="120"
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-amber-500/50"
                      required
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="motherPhone" className="text-sm font-medium text-emerald-50">
                      Mother's phone number
                    </Label>
                    <Input
                      id="motherPhone"
                      type="tel"
                      value={formData.motherPhone}
                      onChange={(e) => handleInputChange("motherPhone", e.target.value)}
                      placeholder="Enter mother's phone number"
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-amber-500/50"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="problemFirstNoticed" className="text-sm font-medium text-emerald-50">
                      When was the problem first noticed?
                    </Label>
                    <Input
                      id="problemFirstNoticed"
                      type="date"
                      value={formData.problemFirstNoticed}
                      onChange={(e) => handleInputChange("problemFirstNoticed", e.target.value)}
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-amber-500/50"
                      required
                    />
                  </div>

                  <div className="rounded-[1.75rem] border border-white/5 bg-black/20 p-5">
                    <p className="text-sm font-semibold text-white">Review</p>
                    <div className="mt-4 grid gap-3 text-sm">
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/20 px-4 py-3">
                        <span className="text-emerald-100/60">Full name</span>
                        <span className="font-medium text-white">{formData.fullName || "Not set"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/20 px-4 py-3">
                        <span className="text-emerald-100/60">Age</span>
                        <span className="font-medium text-white">{formData.age || "Not set"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/20 px-4 py-3">
                        <span className="text-emerald-100/60">Support phone</span>
                        <span className="font-medium text-white">{formData.motherPhone || "Not set"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="bg-red-950/50 border-red-900/50 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between gap-3 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  disabled={step === 0 || loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {step === patientSteps.length - 1 ? (
                  <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold" disabled={loading || !canAdvance}>
                    {loading ? "Saving..." : "Complete Setup"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold"
                    onClick={() => setStep((current) => Math.min(patientSteps.length - 1, current + 1))}
                    disabled={!canAdvance || loading}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
