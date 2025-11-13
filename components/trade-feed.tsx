"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, Users } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Trade {
  id: string
  user: string
  action: "buy" | "sell"
  stock: string
  quantity: number
  price: number
  timestamp: Date
  isTeam?: boolean
  teamName?: string
}

const initialTrades: Trade[] = [
  {
    id: "1",
    user: "Alice K.",
    action: "buy",
    stock: "MTN",
    quantity: 20,
    price: 198.3,
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: "2",
    user: "Kigali Traders",
    action: "sell",
    stock: "BK",
    quantity: 15,
    price: 285.5,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isTeam: true,
    teamName: "Kigali Traders",
  },
  {
    id: "3",
    user: "Sarah N.",
    action: "buy",
    stock: "AGRITECH",
    quantity: 50,
    price: 78.4,
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    id: "4",
    user: "Rwanda Bulls",
    action: "buy",
    stock: "BRALIRWA",
    quantity: 10,
    price: 325.0,
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    isTeam: true,
    teamName: "Rwanda Bulls",
  },
]

const userNames = ["Emma T.", "Michael B.", "Grace W.", "Peter K.", "Linda M.", "James N."]
const teamNames = ["Kigali Traders", "Rwanda Bulls", "East Africa Investors", "Virunga Ventures"]
const stocks = ["BK", "MTN", "AGRITECH", "BRALIRWA", "BKG", "CRYSTAL"]

export function TradeFeed() {
  const [trades, setTrades] = useState<Trade[]>(initialTrades)

  useEffect(() => {
    const interval = setInterval(() => {
      const isTeam = Math.random() > 0.6
      const userName = isTeam
        ? teamNames[Math.floor(Math.random() * teamNames.length)]
        : userNames[Math.floor(Math.random() * userNames.length)]

      const newTrade: Trade = {
        id: Date.now().toString(),
        user: userName,
        action: Math.random() > 0.5 ? "buy" : "sell",
        stock: stocks[Math.floor(Math.random() * stocks.length)],
        quantity: Math.floor(Math.random() * 50) + 5,
        price: Math.random() * 300 + 50,
        timestamp: new Date(),
        isTeam,
        teamName: isTeam ? userName : undefined,
      }

      setTrades((prev) => [newTrade, ...prev.slice(0, 9)])
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <Card className="african-pattern card-hover">
      <CardHeader>
        <CardTitle className="text-foreground">Live Activity</CardTitle>
        <p className="text-sm text-muted-foreground">Real-time trade feed</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {trades.map((trade, index) => (
          <div
            key={trade.id}
            className={`flex items-center gap-3 p-3 rounded-lg border border-border bg-card transition-all duration-500 card-hover ${
              index === 0 ? "animate-slide-up shadow-lg" : ""
            }`}
          >
            {trade.isTeam ? (
              <div className="h-8 w-8 rounded-full border-2 border-border flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <Users className="w-4 h-4 text-primary" />
              </div>
            ) : (
              <Avatar className="h-8 w-8 border-2 border-border">
                <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                  {trade.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{trade.user}</span>{" "}
                  <span
                    className={trade.action === "buy" ? "text-secondary font-medium" : "text-destructive font-medium"}
                  >
                    {trade.action === "buy" ? "bought" : "sold"}
                  </span>{" "}
                  <span className="font-semibold">{trade.quantity}</span> {trade.stock}
                </p>
                {trade.isTeam && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    <Users className="w-2.5 h-2.5 mr-0.5" />
                    Team
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{getTimeAgo(trade.timestamp)}</p>
            </div>

            <div className={`${trade.action === "buy" ? "text-secondary" : "text-destructive"} animate-float`}>
              {trade.action === "buy" ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
