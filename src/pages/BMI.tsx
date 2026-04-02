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
    if (!bmi) return "bg-[#0f291e] text-emerald-100/40 border-emerald-800/20 shadow-none";
    if (bmi < 18.5) return "bg-amber-500/10 text-amber-400 border border-amber-400/30 shadow-none";
    if (bmi < 25) return "bg-emerald-500/10 text-emerald-400 border border-emerald-400/30 shadow-none";
    if (bmi < 30) return "bg-orange-500/10 text-orange-400 border border-orange-400/30 shadow-none";
    return "bg-rose-500/10 text-rose-400 border border-rose-400/30 shadow-none";
  }, [bmi]);

  return (
    <div className="min-h-screen bg-[#0f291e] pb-24 selection:bg-amber-500/30">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-[#0f291e]/80 border-b border-emerald-800/20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-900/40 border border-emerald-700/50 text-white transition hover:bg-emerald-800/60 active:scale-95 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 shadow-sm border border-amber-500/20">
              <HeartPulse className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">BMI Calculator</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8 space-y-6">
        {/* Calculator Card */}
        <Card className="bg-[#0b1f16] border-emerald-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden rounded-[1.8rem]">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-white tracking-tight">Enter your details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="height" className="text-emerald-100/70 text-sm font-medium pl-1">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  inputMode="decimal"
                  placeholder="170"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="h-12 bg-[#0f291e] border-emerald-800/50 text-white placeholder-emerald-100/20 px-4 rounded-2xl focus-visible:ring-amber-500/20 focus-visible:border-amber-500/40 transition-all shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-emerald-100/70 text-sm font-medium pl-1">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  inputMode="decimal"
                  placeholder="65"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="h-12 bg-[#0f291e] border-emerald-800/50 text-white placeholder-emerald-100/20 px-4 rounded-2xl focus-visible:ring-amber-500/20 focus-visible:border-amber-500/40 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-800/30 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-100/40">Your BMI</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black text-white tabular-nums drop-shadow-sm">{bmi ?? "--"}</span>
                  {bmi && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${categoryColor}`}>{category}</span>
                  )}
                </div>
              </div>
              <Button
                type="button"
                className="h-12 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold transition-all active:scale-95 shadow-[0_4px_16px_rgba(245,158,11,0.2)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.3)]"
                onClick={() => {
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
            <div id="bmi-bar" className="mt-6 p-5 rounded-2xl border border-emerald-800/40 bg-emerald-950/40 shadow-inner">
              <div className="h-3 w-full rounded-full bg-emerald-900/60 overflow-hidden relative border border-emerald-800/20 shadow-inner">
                <div
                  className={`h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700 ease-out relative group`}
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                </div>
              </div>
              <div className="mt-3 text-[10px] font-bold text-emerald-100/30 flex justify-between tracking-widest px-1">
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>

            {/* Tips */}
            {bmi && (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-1.5 transition-all">
                <p className="font-bold text-white text-sm">Health Tip:</p>
                <p className="text-xs text-emerald-100/60 leading-relaxed font-medium italic">{tip}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-[#0b1f16] border-emerald-800/50 shadow-[0_4px_24px_rgba(0,0,0,0.2)] rounded-[1.8rem]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white tracking-tight">What is BMI?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-100/60 leading-relaxed font-medium">
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
