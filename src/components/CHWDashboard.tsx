import { useState } from "react";
import { CHWHeader } from "@/components/CHWHeader";
import { CHWNavigation } from "@/components/CHWNavigation";
import { CHWStats } from "@/components/CHWStats";
import { PatientAssignments } from "@/components/PatientAssignments";
import { CHWReport } from "@/components/CHWReport";
import { CHWQuestions } from "@/components/CHWQuestions";

export const CHWDashboard = () => {
  const [tab, setTab] = useState<"overview" | "reports" | "questions">("overview");

  return (
    <div className="min-h-screen bg-secondary/10 pb-28">
      <CHWHeader />
      <CHWNavigation active={tab} onChange={setTab} />
      <div className="p-4 space-y-6">
        {tab === "overview" && (
          <>
            <CHWStats />
            <PatientAssignments />
          </>
        )}
        {tab === "reports" && (
          <>
            <CHWReport />
          </>
        )}
        {tab === "questions" && (
          <>
            <CHWQuestions />
          </>
        )}
      </div>
    </div>
  );
};