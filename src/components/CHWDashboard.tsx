import { CHWHeader } from "@/components/CHWHeader";
import { CHWNavigation } from "@/components/CHWNavigation";
import { CHWStats } from "@/components/CHWStats";
import { PatientAssignments } from "@/components/PatientAssignments";
import { CHWReport } from "@/components/CHWReport";

export const CHWDashboard = () => {
  return (
    <div className="min-h-screen bg-secondary/10 pb-28">
      <CHWHeader />
      <CHWNavigation />
      <div className="p-4 space-y-6">
        <CHWStats />
        <PatientAssignments />
        <CHWReport />
      </div>
    </div>
  );
};