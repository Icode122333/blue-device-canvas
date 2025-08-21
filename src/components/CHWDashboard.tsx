import { CHWHeader } from "@/components/CHWHeader";
import { CHWNavigation } from "@/components/CHWNavigation";
import { CHWStats } from "@/components/CHWStats";
import { PatientAssignments } from "@/components/PatientAssignments";

export const CHWDashboard = () => {
  return (
    <div className="min-h-screen bg-secondary/10">
      <CHWHeader />
      <CHWNavigation />
      <div className="p-4 space-y-6">
        <CHWStats />
        <PatientAssignments />
      </div>
    </div>
  );
};