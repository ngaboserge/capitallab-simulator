"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Newspaper, TrendingUp, Building2, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function NewsFeed() {
  const news = [
    {
      title: "Bank of Kigali Reports Strong Q4 Earnings",
      source: "Rwanda Financial Times",
      time: "2h ago",
      category: "Earnings",
      icon: Building2,
    },
    {
      title: "East African Markets See Bullish Trend",
      source: "EAC Business News",
      time: "4h ago",
      category: "Markets",
      icon: TrendingUp,
    },
    {
      title: "MTN Rwanda Expands 5G Network Coverage",
      source: "Tech Africa",
      time: "6h ago",
      category: "Technology",
      icon: Globe,
    },
    {
      title: "Equity Bank Announces New Digital Services",
      source: "Banking Weekly",
      time: "8h ago",
      category: "Banking",
      icon: Building2,
    },
  ]

  return (
    <Card className="card-hover african-pattern">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Newspaper className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Market News</h3>
        </div>
        {news.map((item, i) => {
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
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
