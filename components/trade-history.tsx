"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TradeHistory() {
  const trades = [
    {
      id: "TXN001",
      type: "buy",
      stock: "BK",
      quantity: 50,
      price: 285.5,
      total: 14275,
      time: "10:30 AM",
      status: "completed",
    },
    {
      id: "TXN002",
      type: "sell",
      stock: "MTN",
      quantity: 30,
      price: 198.7,
      total: 5961,
      time: "09:15 AM",
      status: "completed",
    },
    {
      id: "TXN003",
      type: "buy",
      stock: "EQTY",
      quantity: 100,
      price: 156.3,
      total: 15630,
      time: "Yesterday",
      status: "completed",
    },
    {
      id: "TXN004",
      type: "buy",
      stock: "I&M",
      quantity: 25,
      price: 342.8,
      total: 8570,
      time: "Yesterday",
      status: "completed",
    },
  ]

  return (
    <Card className="card-hover african-pattern">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Trade History</CardTitle>
            <p className="text-sm text-muted-foreground">Your recent transactions</p>
          </div>
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4 space-y-2">
            {trades.map((trade, i) => (
              <TradeItem key={trade.id} trade={trade} index={i} />
            ))}
          </TabsContent>
          <TabsContent value="buy" className="mt-4 space-y-2">
            {trades
              .filter((t) => t.type === "buy")
              .map((trade, i) => (
                <TradeItem key={trade.id} trade={trade} index={i} />
              ))}
          </TabsContent>
          <TabsContent value="sell" className="mt-4 space-y-2">
            {trades
              .filter((t) => t.type === "sell")
              .map((trade, i) => (
                <TradeItem key={trade.id} trade={trade} index={i} />
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function TradeItem({ trade, index }: { trade: any; index: number }) {
  const isBuy = trade.type === "buy"
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all animate-slide-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isBuy ? "bg-secondary/10" : "bg-destructive/10"}`}>
          {isBuy ? (
            <ArrowUpCircle className="w-4 h-4 text-secondary" />
          ) : (
            <ArrowDownCircle className="w-4 h-4 text-destructive" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{trade.stock}</p>
            <Badge variant={isBuy ? "default" : "destructive"} className="text-xs">
              {isBuy ? "Buy" : "Sell"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {trade.quantity} shares @ RWF {trade.price.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">RWF {trade.total.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{trade.time}</p>
      </div>
    </div>
  )
}
