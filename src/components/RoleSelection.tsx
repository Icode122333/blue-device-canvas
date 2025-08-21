import { Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleSelectionProps {
  onRoleSelect: (role: 'chw' | 'patient') => void;
}

export const RoleSelection = ({ onRoleSelect }: RoleSelectionProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome</h1>
          <p className="text-muted-foreground">Please select your role to continue</p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={() => onRoleSelect('chw')}
            variant="outline"
            className="w-full h-24 flex flex-col gap-2 border-primary/20 hover:border-primary hover:bg-primary/5"
          >
            <Users className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="font-semibold text-foreground">Community Health Worker</div>
              <div className="text-sm text-muted-foreground">Manage patients and appointments</div>
            </div>
          </Button>
          
          <Button
            onClick={() => onRoleSelect('patient')}
            variant="outline"
            className="w-full h-24 flex flex-col gap-2 border-primary/20 hover:border-primary hover:bg-primary/5"
          >
            <Heart className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="font-semibold text-foreground">Patient</div>
              <div className="text-sm text-muted-foreground">View your therapy progress</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};