"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Newspaper, TrendingUp, Building2, Globe, Users, MessageSquare, ThumbsUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function TeamNewsFeed() {
  const teamNews = [
    {
      title: "Bank of Kigali Reports Strong Q4 Earnings",
      source: "Rwanda Financial Times",
      time: "2h ago",
      category: "Earnings",
      icon: Building2,
      teamReactions: 3,
      comments: [
        { member: "Sarah K.", comment: "Great opportunity for our portfolio!", initials: "SK" },
        { member: "Alex M.", comment: "Should we increase our position?", initials: "AM" }
      ]
    },
    {
      title: "East African Markets See Bullish Trend",
      source: "EAC Business News",
      time: "4h ago",
      category: "Markets",
      icon: TrendingUp,
      teamReactions: 5,
      comments: [
        { member: "John D.", comment: "This aligns with our strategy", initials: "JD" }
      ]
    },
    {
      title: "MTN Rwanda Expands 5G Network Coverage",
      source: "Tech Africa",
      time: "6h ago",
      category: "Technology",
      icon: Globe,
      teamReactions: 2,
      comments: []
    },
    {
      title: "Equity Bank Announces New Digital Services",
      source: "Banking Weekly",
      time: "8h ago",
      category: "Banking",
      icon: Building2,
      teamReactions: 4,
      comments: [
        { member: "Emma R.", comment: "Digital transformation is key", initials: "ER" },
        { member: "Sarah K.", comment: "Bullish on fintech sector", initials: "SK" }
      ]
    },
  ]

  return (
    <Card className="card-hover african-pattern">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Newspaper className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Team Market News</h3>
        </div>
        {teamNews.map((item, i) => {
          const Icon = item.icon
          return (
            <div
              key={i}
              className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{item.source}</span>
                    <span className="text-xs text-muted-foreground">• {item.time}</span>
                  </div>
                  
                  {/* Team Interactions */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {item.teamReactions}
                      </Button>
                    </div>
                    {item.comments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{item.comments.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Team Comments Preview */}
                  {item.comments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {item.comments.slice(0, 2).map((comment, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="bg-secondary/10 text-secondary text-xs font-semibold">
                              {comment.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-foreground">{comment.member}:</span>
                            <span className="text-muted-foreground ml-1">{comment.comment}</span>
                          </div>
                        </div>
                      ))}
                      {item.comments.length > 2 && (
                        <Button size="sm" variant="ghost" className="h-6 text-xs text-muted-foreground">
                          View all {item.comments.length} comments
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}