"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIndividualTrading } from "@/contexts/individual-trading-context"

export function IndividualTradeHistory() {
  const { state } = useIndividualTrading()
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
            <IndividualTradeItem key={trade.id} trade={trade} index={i} />
          ))
        )}
      </div>
    )
  }

  return (
    <Card className="card-hover african-pattern">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Trade History</CardTitle>
            <p className="text-sm text-muted-foreground">Your personal trading records</p>
          </div>
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({trades.length})</TabsTrigger>
            <TabsTrigger value="buy">Buy ({trades.filter(t => t.type === "buy").length})</TabsTrigger>
            <TabsTrigger value="sell">Sell ({trades.filter(t => t.type === "sell").length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <TradeList filteredTrades={trades} />
          </TabsContent>
          <TabsContent value="buy" className="mt-4">
            <TradeList filteredTrades={trades.filter((t) => t.type === "buy")} />
          </TabsContent>
          <TabsContent value="sell" className="mt-4">
            <TradeList filteredTrades={trades.filter((t) => t.type === "sell")} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function IndividualTradeItem({ trade, index }: { trade: any; index: number }) {
  const isBuy = trade.type === "buy"
  const isPending = trade.status === "pending"

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
                Pending
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-1">
            {trade.quantity} shares @ RWF {trade.price.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {trade.orderType} order • {trade.time}
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