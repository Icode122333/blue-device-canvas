import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Play, Download, FileText } from "lucide-react";

export const Guides = () => {
  const guides = [
    {
      id: 1,
      title: "Daily Exercise Routine",
      description: "Essential exercises for cerebral palsy patients",
      type: "video",
      duration: "15 min",
      icon: Play,
    },
    {
      id: 2,
      title: "Mobility Guide",
      description: "Tips for improving mobility and independence",
      type: "pdf",
      pages: "12 pages",
      icon: FileText,
    },
    {
      id: 3,
      title: "Nutrition Guidelines",
      description: "Proper nutrition for better health outcomes",
      type: "article",
      readTime: "8 min read",
      icon: BookOpen,
    }
  ];

  return (
    <Card className="mx-4 mb-4 bg-gradient-to-r from-accent/30 to-accent/20 border-accent/30 shadow-soft">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Guides & Resources</h2>
        </div>
        <div className="space-y-3">
          {guides.map((guide) => {
            const IconComponent = guide.icon;
            return (
              <div
                key={guide.id}
                className="flex items-center gap-3 p-3 bg-background/80 rounded-lg border border-accent/20 hover:bg-background/90 transition-colors cursor-pointer group"
              >
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground text-sm">{guide.title}</h3>
                  <p className="text-xs text-muted-foreground">{guide.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-primary font-medium">
                      {guide.type === 'video' && guide.duration}
                      {guide.type === 'pdf' && guide.pages}
                      {guide.type === 'article' && guide.readTime}
                    </span>
                  </div>
                </div>
                <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};