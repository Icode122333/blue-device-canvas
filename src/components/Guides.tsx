import { BookOpen, Play, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const guides = [
  {
    id: 1,
    title: "Daily Exercise Routine",
    description: "Learn effective exercises for your rehabilitation",
    icon: Play,
    color: "bg-pale-green",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Nutrition Guidelines", 
    description: "Healthy eating habits for better recovery",
    icon: Heart,
    color: "bg-pale-blue",
    readTime: "7 min read"
  },
  {
    id: 3,
    title: "Home Care Tips",
    description: "Essential tips for daily care and support",
    icon: BookOpen,
    color: "bg-primary-light",
    readTime: "4 min read"
  }
];

export const Guides = () => {
  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Helpful Guides</h2>
        <button className="text-primary text-sm font-medium hover:text-primary-dark transition-colors">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {guides.map((guide, index) => {
          const IconComponent = guide.icon;
          return (
            <Card 
              key={guide.id}
              className="hover-lift cursor-pointer border-0 bg-gradient-to-br from-white to-secondary shadow-sm hover:shadow-medium transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${guide.color}`}>
                    <IconComponent className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {guide.description}
                    </p>
                    <div className="text-xs text-primary font-medium">
                      {guide.readTime}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};