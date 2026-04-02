import { Users, FileText, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const CHWStats = () => {
  const [assignedCount, setAssignedCount] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number | null>(null);

  useEffect(() => {
    let channel: any;
    const load = async (uid?: string) => {
      let userId = uid;
      if (!userId) {
        const { data: userRes } = await supabase.auth.getUser();
        userId = userRes.user?.id;
      }
      if (!userId) return;

      const { count: assignmentsCount } = await supabase.from("chw_assignments").select("*", { count: "exact", head: true }).eq("chw_id", userId);
      setAssignedCount(assignmentsCount ?? 0);

      const { count: questionsCount } = await supabase.from("community_questions").select("*", { count: "exact", head: true });
      setQuestionCount(questionsCount ?? 0);
    };

    const setup = async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return;
      await load(uid);
      channel = supabase
        .channel("chw_assignments_stats")
        .on("postgres_changes", { event: "*", schema: "public", table: "chw_assignments", filter: `chw_id=eq.${uid}` }, () => {
          load(uid);
        })
        .subscribe();
    };

    setup();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const stats = [
    { id: 1, title: "Assigned Patients", value: assignedCount === null ? "--" : String(assignedCount), change: "+8%", icon: Users, color: "bg-primary", statusColor: undefined },
    { id: 2, title: "Community Questions", value: questionCount === null ? "--" : String(questionCount), status: "Open", icon: FileText, color: "bg-accent", statusColor: "bg-accent/15 text-accent border-accent/30" },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.id} className="panel-soft p-4 transition-all hover:scale-[1.01] clay-fade-in">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className={`flex h-12 w-12 items-center justify-center rounded-[1rem] ${stat.color} shadow-[0_18px_30px_hsl(220_35%_2%_/_0.2)]`}>
                  <IconComponent className="h-6 w-6 text-primary-foreground drop-shadow" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                </div>
              </div>
              <div className="space-y-1 text-right">
                {(stat as any).change && (
                  <div className="flex items-center gap-1 text-sm font-medium text-primary">
                    <TrendingUp className="h-3 w-3" />
                    {(stat as any).change}
                  </div>
                )}
                {(stat as any).status && (
                  <Badge className={(stat as any).statusColor}>
                    {(stat as any).status}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
