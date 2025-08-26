import { useState } from "react";
import { MessageCircle, Heart, Users, Send, Smile, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const posts = [
  {
    id: 1,
    author: "Sarah M.",
    avatar: "/placeholder.svg",
    time: "2h ago",
    content: "Just completed my first week of physiotherapy! Feeling stronger every day. Thank you to all the amazing therapists! 💪",
    likes: 12,
    comments: 5,
    category: "success"
  },
  {
    id: 2,
    author: "John K.",
    avatar: "/placeholder.svg", 
    time: "4h ago",
    content: "Looking for recommendations on mobility aids. What has worked best for everyone here?",
    likes: 8,
    comments: 15,
    category: "question"
  },
  {
    id: 3,
    author: "Dr. Rwanda",
    avatar: "/placeholder.svg",
    time: "1d ago", 
    content: "Weekly reminder: Consistency is key in rehabilitation. Small daily progress leads to significant improvements! 🌟",
    likes: 25,
    comments: 8,
    category: "tip",
    isVerified: true
  }
];

const categories = [
  { name: "All", count: 45, active: true },
  { name: "Success Stories", count: 12, active: false },
  { name: "Questions", count: 18, active: false },
  { name: "Tips", count: 15, active: false }
];

export const ModernCommunity = () => {
  const [newPost, setNewPost] = useState("");

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "success": return "bg-primary text-primary-foreground";
      case "question": return "bg-pale-blue text-accent-foreground";
      case "tip": return "bg-pale-green text-pale-green-foreground";
      default: return "bg-secondary";
    }
  };

  return (
    <div className="p-4 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Community</h1>
        <p className="text-sm text-muted-foreground">Connect with others on their journey</p>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category, index) => (
          <Button
            key={index}
            variant={category.active ? "default" : "outline"}
            size="sm"
            className={`rounded-full whitespace-nowrap ${
              category.active 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-white/80 border-primary/20 hover:bg-primary/10"
            }`}
          >
            {category.name}
            <Badge 
              variant="secondary" 
              className="ml-2 text-xs bg-white/20 text-current"
            >
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Create Post */}
      <Card className="mb-6 border-0 bg-gradient-to-br from-white to-secondary shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <Input
                placeholder="Share your experience or ask a question..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="border-0 bg-pale-green/30 focus:bg-white transition-colors"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="rounded-full p-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full p-2">
                    <Smile className="h-4 w-4 text-primary" />
                  </Button>
                </div>
                
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-full px-4"
                  disabled={!newPost.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <Card 
            key={post.id}
            className="hover-lift border-0 bg-gradient-to-br from-white to-secondary shadow-sm hover:shadow-medium transition-all duration-300"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.avatar} />
                  <AvatarFallback>
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{post.author}</span>
                    {post.isVerified && (
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        Verified
                      </Badge>
                    )}
                    <Badge className={`text-xs ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{post.time}</span>
                </div>
              </div>
              
              <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>
              
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {post.likes}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {post.comments}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Community Stats */}
      <Card className="mt-6 border-0 bg-gradient-to-br from-pale-blue to-accent">
        <CardContent className="p-4">
          <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Community Stats
          </h3>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-semibold text-foreground">342</div>
              <div className="text-xs text-muted-foreground">Members</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-foreground">89</div>
              <div className="text-xs text-muted-foreground">Posts Today</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-foreground">156</div>
              <div className="text-xs text-muted-foreground">Active Now</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};