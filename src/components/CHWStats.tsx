import { Users, MapPin, FileText, AlertTriangle, TrendingUp } from "lucide-react";
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

      const { count: assignmentsCount } = await supabase
        .from('chw_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('chw_id', userId);
      setAssignedCount(assignmentsCount ?? 0);

      const { count: questionsCount } = await supabase
        .from('community_questions')
        .select('*', { count: 'exact', head: true });
      setQuestionCount(questionsCount ?? 0);
    };

    const setup = async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return;
      await load(uid);
      channel = supabase
        .channel('chw_assignments_stats')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chw_assignments', filter: `chw_id=eq.${uid}` }, () => {
          load(uid);
        })
        .subscribe();
    };

    setup();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const stats = [
    { id: 1, title: 'Assigned Patients', value: assignedCount === null ? '—' : String(assignedCount), change: '+8%', icon: Users, color: 'bg-primary', statusColor: undefined },
    { id: 2, title: 'Community Questions', value: questionCount === null ? '—' : String(questionCount), status: 'Open', icon: FileText, color: 'bg-orange-500', statusColor: 'bg-orange-100 text-orange-700' },
  ] as const;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.id} className="clay-card p-4 transition-all hover:shadow-lg hover:scale-[1.01] clay-fade-in">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-inner ring-1 ring-white/40 shadow-black/10`}>
                  <IconComponent className="h-6 w-6 text-white drop-shadow" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                </div>
              </div>
              <div className="text-right space-y-1">
                {(stat as any).change && (
                  <div className="flex items-center gap-1 text-primary text-sm font-medium">
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