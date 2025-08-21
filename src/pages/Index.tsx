import { ProfileHeader } from "@/components/ProfileHeader";
import { Navigation } from "@/components/Navigation";
import { InfoCard } from "@/components/InfoCard";
import { DeviceList } from "@/components/DeviceList";
import { AppointmentList } from "@/components/AppointmentList";

const Index = () => {
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