import { useState } from "react";
import { RoleSelection } from "@/components/RoleSelection";
import { CHWDashboard } from "@/components/CHWDashboard";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Navigation } from "@/components/Navigation";
import { InfoCard } from "@/components/InfoCard";
import { DeviceList } from "@/components/DeviceList";
import { AppointmentList } from "@/components/AppointmentList";

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<'chw' | 'patient' | null>(null);

  if (!selectedRole) {
    return <RoleSelection onRoleSelect={setSelectedRole} />;
  }

  if (selectedRole === 'chw') {
    return <CHWDashboard />;
  }

  // Patient view (existing design)
  return (
    <div className="min-h-screen bg-secondary/20 pb-20">
      <ProfileHeader />
      <Navigation />
      <InfoCard />
      <DeviceList />
      <AppointmentList />
    </div>
  );
};

export default Index;