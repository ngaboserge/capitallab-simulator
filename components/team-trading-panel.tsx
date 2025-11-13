"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare } from "lucide-react"
import { StockList } from "@/components/stock-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamTradeInterface } from "@/components/team-trade-interface"

export function TeamTradingPanel() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null)

  return (
    <Card className="card-hover african-pattern">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" />
              Team Trading
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Collaborate on trades with your team</p>
          </div>
          <Badge className="bg-secondary/10 text-secondary border-secondary/20">
            <MessageSquare className="w-3 h-3 mr-1" />
            Team Chat
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-semibold text-foreground">Team Trading:</span> All trades are visible to team members.
            Coordinate your strategy for maximum returns!
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-secondary/20 text-secondary hover:bg-secondary/10 bg-transparent"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Open Team Chat
          </Button>
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
            <TeamTradeInterface selectedStock={selectedStock} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
