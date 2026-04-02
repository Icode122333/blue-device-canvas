import { ArrowRight, Brain, HeartPulse, Lightbulb, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const InfoCard = () => {
  return (
    <div className="mx-4 mt-6 panel-soft overflow-hidden border-primary/20 bg-[linear-gradient(140deg,hsl(79_100%_62%_/_0.92),hsl(51_100%_70%_/_0.88))] text-primary-foreground">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,hsl(220_20%_8%_/_0.12),transparent_70%)]" />
      <div className="relative z-10 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-black/70">
              <Lightbulb className="h-4 w-4" />
              Did you know
            </div>
            <div className="max-w-xl space-y-3">
              <h2 className="text-2xl font-bold text-black sm:text-3xl">Regular monitoring can improve recovery outcomes.</h2>
              <p className="max-w-lg text-sm leading-6 text-black/70 sm:text-base">
                Device follow-up, physiotherapy, and caregiver support work better when progress is tracked early and consistently.
              </p>
            </div>
          </div>
          <div className="hidden rounded-[1.75rem] border border-black/10 bg-black/10 p-4 text-black/80 sm:block">
            <Brain className="h-10 w-10" />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: HeartPulse, title: "Early action", copy: "Therapy tends to work best when support begins early." },
            { icon: ShieldCheck, title: "Ongoing support", copy: "Families and care teams can adjust sooner when they stay informed." },
            { icon: Brain, title: "Clearer context", copy: "Tracking symptoms helps clinicians make better decisions over time." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[1.5rem] border border-black/10 bg-black/10 p-4 text-black">
                <Icon className="h-5 w-5" />
                <p className="mt-3 text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-black/65">{item.copy}</p>
              </div>
            );
          })}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/85">
              <span>Learn More</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] max-w-2xl flex flex-col">
            <DialogHeader>
              <DialogTitle>About Cerebral Palsy (CP)</DialogTitle>
              <DialogDescription>Understand CP in simple terms</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-card-foreground">What is CP?</p>
                <p>CP is a group of conditions that affect movement, muscle tone, and posture due to early brain development differences or injury.</p>
              </div>
              <div>
                <p className="font-medium text-card-foreground">How does someone get CP?</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Before birth: infections during pregnancy, poor brain development, genetic factors.</li>
                  <li>During birth: lack of oxygen, difficult or very early birth.</li>
                  <li>After birth: serious infections, head injury, or severe jaundice.</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-card-foreground">Common signs</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Delays in rolling, sitting, crawling, or walking.</li>
                  <li>Stiff or floppy muscles, unusual posture, and toe-walking.</li>
                  <li>Weakness on one side of the body.</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-card-foreground">Types</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Spastic, Dyskinetic, Ataxic, or Mixed.</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-card-foreground">Management</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Early physiotherapy and exercises improve movement and independence.</li>
                  <li>Assistive devices and medication may help in some cases.</li>
                  <li>Nutrition, communication, and caregiver support remain important.</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-card-foreground">When to seek care</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>If milestones are delayed or muscle stiffness or weakness worsens.</li>
                  <li>If pain, seizures, feeding issues, or breathing problems occur.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-primary">
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
