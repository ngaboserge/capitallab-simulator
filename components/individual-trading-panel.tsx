"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"
import { StockList } from "@/components/stock-list"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IndividualTradeInterface } from "./individual-trade-interface"

export function IndividualTradingPanel() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null)

  return (
    <Card className="card-hover african-pattern">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-secondary" />
              Individual Trading
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Trade with your personal portfolio</p>
          </div>
          <Badge className="bg-secondary/10 text-secondary border-secondary/20">
            Personal Account
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Individual Trading:</span> All trades are made with your personal funds.
            Build your own portfolio and track your performance!
          </p>
        </div>

        <Tabs defaultValue="stocks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="trade" disabled={!selectedStock}>
              Trade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stocks">
            <StockList onSelectStock={setSelectedStock} selectedStock={selectedStock} />
          </TabsContent>

          <TabsContent value="trade">
            <IndividualTradeInterface selectedStock={selectedStock} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}