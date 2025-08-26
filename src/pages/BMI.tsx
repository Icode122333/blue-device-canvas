import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HeartPulse } from "lucide-react";

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

const BMI = () => {
  const [heightCm, setHeightCm] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");

  const { bmi, category, tip } = useMemo(() => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (!h || !w || h <= 0 || w <= 0) return { bmi: null as number | null, category: "", tip: "" };
    const value = +(w / Math.pow(h / 100, 2)).toFixed(1);
    let cat = "";
    let tipText = "";
    if (value < 18.5) {
      cat = "Underweight";
      tipText = "Consider a balanced diet with more calories and strength exercises.";
    } else if (value < 25) {
      cat = "Normal";
      tipText = "Great job! Keep a balanced diet and regular activity.";
    } else if (value < 30) {
      cat = "Overweight";
      tipText = "Focus on consistent movement and mindful nutrition.";
    } else {
      cat = "Obesity";
      tipText = "Consult a healthcare professional for a personalized plan.";
    }
    return { bmi: value, category: cat, tip: tipText };
  }, [heightCm, weightKg]);

  const progress = useMemo(() => {
    if (!bmi) return 0;
    // Map BMI range 10-40 to 0-100 for a simple visual
    return Math.round(((clamp(bmi, 10, 40) - 10) / 30) * 100);
  }, [bmi]);

  const categoryColor = useMemo(() => {
    if (!bmi) return "bg-slate-200 text-slate-700";
    if (bmi < 18.5) return "bg-amber-100 text-amber-700";
    if (bmi < 25) return "bg-emerald-100 text-emerald-700";
    if (bmi < 30) return "bg-orange-100 text-orange-700";
    return "bg-rose-100 text-rose-700";
  }, [bmi]);

  return (
    <div className="min-h-screen bg-secondary/20 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="inline-flex items-center justify-center w-9 h-9 rounded-full border hover:shadow transition bg-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            <h1 className="text-base font-semibold">BMI Calculator</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">
        {/* Calculator Card */}
        <Card className="clay-card clay-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Enter your details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  inputMode="decimal"
                  placeholder="170"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  inputMode="decimal"
                  placeholder="65"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your BMI</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-semibold tracking-tight">{bmi ?? "--"}</span>
                  {bmi && (
                    <span className={`text-xs px-2 py-0.5 rounded ${categoryColor}`}>{category}</span>
                  )}
                </div>
              </div>
              <Button
                type="button"
                className="clay-button"
                onClick={() => {
                  // Simple microinteraction: pulse the card
                  const el = document.getElementById("bmi-bar");
                  if (el) {
                    el.animate(
                      [
                        { transform: "scale(1)" },
                        { transform: "scale(1.02)" },
                        { transform: "scale(1)" },
                      ],
                      { duration: 300, easing: "ease-out" }
                    );
                  }
                }}
              >
                Update
              </Button>
            </div>

            {/* Progress Bar */}
            <div id="bmi-bar" className="mt-4 p-3 rounded-xl border bg-gradient-to-b from-white to-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">
              <div className="h-3 w-full rounded-full bg-slate-200/70 overflow-hidden">
                <div
                  className={`h-full bg-emerald-500 transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>

            {/* Tips */}
            {bmi && (
              <div className="mt-5 text-sm text-muted-foreground">
                <p className="font-medium text-card-foreground">Tip:</p>
                <p>{tip}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="clay-card clay-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">What is BMI?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Body Mass Index (BMI) is a simple index of weight-for-height commonly used to classify
              underweight, overweight and obesity in adults. While useful as a screening tool, it does not
              directly assess body fat or health. Consult a healthcare professional for a full assessment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BMI;
