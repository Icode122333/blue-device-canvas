import { Eye, ArrowRight } from "lucide-react";

export const InfoCard = () => {
  return (
    <div className="mx-4 mt-6 p-6 rounded-2xl text-white relative overflow-hidden" 
         style={{ background: 'var(--gradient-card)' }}>
      <div className="relative z-10">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white/20 rounded-full">
            <Eye className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-center mb-2">Did You Know?</h2>
        <p className="text-center text-white/90 mb-4">
          Regular device monitoring can greatly improve treatment outcomes
        </p>
        <button className="flex items-center justify-center gap-2 mx-auto text-white hover:text-white/80 transition-colors">
          <span className="text-sm font-medium">Learn More</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};