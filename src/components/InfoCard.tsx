import { Lightbulb, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const InfoCard = () => {
  return (
    <div
      className="mx-4 mt-6 p-6 rounded-2xl text-white relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 shadow-[0_12px_36px_rgba(16,185,129,0.35)]"
    >
      <div className="relative z-10">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white/20 rounded-full">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-center mb-2">Did You Know?</h2>
        <p className="text-center text-white/90 mb-4">
          Regular device monitoring can greatly improve treatment outcomes
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center justify-center gap-2 mx-auto text-white hover:text-white/80 transition-colors">
              <span className="text-sm font-medium">Learn More</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>About Cerebral Palsy (CP)</DialogTitle>
              <DialogDescription>Understand CP in simple terms</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-card-foreground">What is CP?</p>
                <p>CP is a group of conditions that affect movement, muscle tone, and posture due to early brain development differences or injury.</p>
              </div>
              <div>
                <p className="font-medium text-card-foreground">How does someone get CP?</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Before birth: infections during pregnancy, poor brain development, genetic factors.</li>
                  <li>During birth: lack of oxygen, difficult or very early birth.</li>
                  <li>After birth: serious infections (e.g., meningitis), head injury, severe jaundice.</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-card-foreground">Common signs</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Delays in rolling, sitting, crawling, or walking.</li>
                  <li>Stiff or floppy muscles, unusual posture, toe-walking.</li>
                  <li>Weakness on one side of the body.</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-card-foreground">Types</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Spastic (stiff muscles), Dyskinetic (uncontrolled movements), Ataxic (balance/coordination), or Mixed.</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-card-foreground">Management</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Early physiotherapy and exercises improve movement and independence.</li>
                  <li>Assistive devices (braces, walkers), medications for spasticity if needed.</li>
                  <li>Nutrition, communication, and caregiver support are important.</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-card-foreground">When to seek care</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>If milestones are delayed or muscle stiffness/weakness worsens.</li>
                  <li>If pain, seizures, feeding issues, or breathing problems occur.</li>
                </ul>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-3">
                <p className="font-medium">Remember</p>
                <p>CP is not contagious. With the right support, children and adults with CP can learn, play, and thrive.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};