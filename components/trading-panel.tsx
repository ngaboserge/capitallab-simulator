"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockList } from "@/components/stock-list"
import { TradeInterface } from "@/components/trade-interface"
import { Badge } from "@/components/ui/badge"
import { User, Users } from "lucide-react"

interface TradingPanelProps {
  mode?: "individual" | "team"
}

export function TradingPanel({ mode = "individual" }: TradingPanelProps) {
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [tradeMode, setTradeMode] = useState<"individual" | "team">(mode)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Live Trading</CardTitle>
            <p className="text-sm text-muted-foreground">Trade Rwandan and African companies</p>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={tradeMode === "individual" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTradeMode("individual")}
            >
              <User className="w-3 h-3 mr-1" />
              Individual
            </Badge>
            {mode !== "individual" && (
              <Badge
                variant={tradeMode === "team" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTradeMode("team")}
              >
                <Users className="w-3 h-3 mr-1" />
                Team
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stocks" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stocks">Available Stocks</TabsTrigger>
            <TabsTrigger value="trade">Trade</TabsTrigger>
          </TabsList>
          <TabsContent value="stocks" className="mt-4">
            <StockList onSelectStock={setSelectedStock} selectedStock={selectedStock} />
          </TabsContent>
          <TabsContent value="trade" className="mt-4">
            <TradeInterface selectedStock={selectedStock} tradeMode={tradeMode} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
