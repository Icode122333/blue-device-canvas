import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Stethoscope, Users, Send, Clock } from "lucide-react";

export const Community = () => {
  const [selectedType, setSelectedType] = useState<"physio" | "community" | null>(null);
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    if (!selectedType || !question.trim()) return;
    
    // Here you would handle the question submission
    console.log("Submitting question:", { type: selectedType, question });
    
    // Reset form
    setQuestion("");
    setSelectedType(null);
  };

  const mockQuestions = [
    {
      id: 1,
      question: "My child is 3 years old and still doesn't walk properly. What exercises can help?",
      type: "physio",
      author: "Sarah M.",
      time: "2 hours ago",
      answers: 3
    },
    {
      id: 2,
      question: "Any other parents dealing with similar issues? How do you motivate your child?",
      type: "community",
      author: "Ahmed K.",
      time: "5 hours ago",
      answers: 7
    }
  ];

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Ask Question Section */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-primary" />
            Ask a Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question Type Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Who would you like to ask?</p>
            <div className="flex gap-3">
              <Button
                variant={selectedType === "physio" ? "default" : "outline"}
                onClick={() => setSelectedType("physio")}
                className="flex-1 h-auto p-4 flex-col gap-2"
              >
                <Stethoscope className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Physiotherapist</div>
                  <div className="text-xs opacity-75">Expert medical advice</div>
                </div>
              </Button>
              <Button
                variant={selectedType === "community" ? "default" : "outline"}
                onClick={() => setSelectedType("community")}
                className="flex-1 h-auto p-4 flex-col gap-2"
              >
                <Users className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Community</div>
                  <div className="text-xs opacity-75">Connect with other parents</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Question Input */}
          {selectedType && (
            <div className="space-y-3 animate-fade-in">
              <Textarea
                placeholder={`Ask your question to the ${selectedType === "physio" ? "physiotherapist" : "community"}...`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[100px] resize-none border-input/50 focus:border-primary/50"
              />
              <Button 
                onClick={handleSubmit}
                disabled={!question.trim()}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Question
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Questions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Recent Questions
        </h3>
        
        {mockQuestions.map((q) => (
          <Card key={q.id} className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <p className="text-sm leading-relaxed">{q.question}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Badge 
                      variant={q.type === "physio" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {q.type === "physio" ? (
                        <>
                          <Stethoscope className="h-3 w-3 mr-1" />
                          Physio
                        </>
                      ) : (
                        <>
                          <Users className="h-3 w-3 mr-1" />
                          Community
                        </>
                      )}
                    </Badge>
                    <span>{q.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {q.time}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {q.answers} {q.answers === 1 ? 'answer' : 'answers'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};