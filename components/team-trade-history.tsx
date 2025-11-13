"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpCircle, ArrowDownCircle, Clock, Vote } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTeamTrading } from "@/contexts/team-trading-context"

export function TeamTradeHistory() {
  const { state } = useTeamTrading()
  const trades = state.trades

  const TradeList = ({ filteredTrades }: { filteredTrades: any[] }) => {
    return (
      <div className="max-h-[800px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {filteredTrades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No trades in this category yet.</p>
          </div>
        ) : (
          filteredTrades.map((trade, i) => (
            <TeamTradeItem key={trade.id} trade={trade} index={i} />
          ))
        )}
      </div>
    )
  }

  const buyTrades = trades.filter((t) => t.type === "buy")
  const sellTrades = trades.filter((t) => t.type === "sell")
  const pendingTrades = trades.filter((t) => t.status === "pending")

  return (
    <Card className="card-hover african-pattern">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Team Trade History</CardTitle>
            <p className="text-sm text-muted-foreground">Collaborative trading decisions</p>
          </div>
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({trades.length})</TabsTrigger>
            <TabsTrigger value="buy">Buy ({buyTrades.length})</TabsTrigger>
            <TabsTrigger value="sell">Sell ({sellTrades.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingTrades.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <TradeList filteredTrades={trades} />
          </TabsContent>
          <TabsContent value="buy" className="mt-4">
            <TradeList filteredTrades={buyTrades} />
          </TabsContent>
          <TabsContent value="sell" className="mt-4">
            <TradeList filteredTrades={sellTrades} />
          </TabsContent>
          <TabsContent value="pending" className="mt-4">
            <TradeList filteredTrades={pendingTrades} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function TeamTradeItem({ trade, index }: { trade: any; index: number }) {
  const isBuy = trade.type === "buy"
  const isPending = trade.status === "pending"
  
  const getConsensusColor = (consensus: string) => {
    switch (consensus) {
      case "unanimous": return "text-green-500"
      case "approved": return "text-secondary"
      case "voting": return "text-orange-500"
      default: return "text-muted-foreground"
    }
  }

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition-all animate-slide-up ${
        isPending ? "bg-orange-500/10 border border-orange-500/20" : "bg-muted/30 hover:bg-muted/50"
      }`}
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
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground">{trade.stock}</p>
            <Badge variant={isBuy ? "default" : "destructive"} className="text-xs">
              {isBuy ? "Buy" : "Sell"}
            </Badge>
            {isPending && (
              <Badge variant="outline" className="text-xs border-orange-500/20 text-orange-500">
                Voting
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-1">
            {trade.quantity} shares @ RWF {trade.price.toFixed(2)}
          </p>
          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5">
              <AvatarFallback className="bg-secondary/10 text-secondary text-xs font-semibold">
                {trade.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">by {trade.proposedBy}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <div className="flex items-center gap-1">
              <Vote className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {trade.votes.for}:{trade.votes.against}
              </span>
            </div>
            <span className={`text-xs font-medium ${getConsensusColor(trade.consensus)}`}>
              {trade.consensus}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">RWF {trade.total.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{trade.time}</p>
      </div>
    </div>
  )
}