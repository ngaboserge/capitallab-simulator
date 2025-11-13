"use client"

import { useState } from "react"
import {
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Area,
  Bar,
  ComposedChart,
  BarChart, // Declared BarChart variable
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, BarChart3, CandlestickChart } from "lucide-react"

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sector: string
}

interface StockChartProps {
  stock: Stock
}

const generateStockData = (basePrice: number, days: number) => {
  const data = []
  let price = basePrice * 0.85
  let sma20 = price
  let sma50 = price

  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.45) * (basePrice * 0.03)
    price = Math.max(price + change, basePrice * 0.7)

    // Calculate moving averages
    if (i >= 20) {
      sma20 = data.slice(i - 20, i).reduce((sum, d) => sum + d.price, 0) / 20
    }
    if (i >= 50) {
      sma50 = data.slice(i - 50, i).reduce((sum, d) => sum + d.price, 0) / 50
    }

    // Generate volume (higher volume on bigger price changes)
    const volume = Math.floor(Math.random() * 50000 + 10000 + Math.abs(change) * 5000)

    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: Number.parseFloat(price.toFixed(2)),
      volume,
      sma20: Number.parseFloat(sma20.toFixed(2)),
      sma50: Number.parseFloat(sma50.toFixed(2)),
      // Candlestick data
      open: Number.parseFloat((price - change * 0.5).toFixed(2)),
      high: Number.parseFloat((price + Math.abs(change) * 0.3).toFixed(2)),
      low: Number.parseFloat((price - Math.abs(change) * 0.3).toFixed(2)),
      close: Number.parseFloat(price.toFixed(2)),
    })
  }

  data[data.length - 1].price = basePrice
  data[data.length - 1].close = basePrice

  return data
}

export function StockChart({ stock }: StockChartProps) {
  const data1D = generateStockData(stock.price, 24)
  const data1W = generateStockData(stock.price, 7)
  const data1M = generateStockData(stock.price, 30)
  const data3M = generateStockData(stock.price, 90)

  const [chartType, setChartType] = useState<"area" | "line" | "candlestick">("area")
  const [showVolume, setShowVolume] = useState(true)
  const [showIndicators, setShowIndicators] = useState(false)

  const chartConfig = {
    price: {
      label: "Price (RWF)",
      color: stock.change >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))",
    },
    volume: {
      label: "Volume",
      color: "hsl(var(--muted-foreground))",
    },
    sma20: {
      label: "SMA 20",
      color: "hsl(var(--chart-3))",
    },
    sma50: {
      label: "SMA 50",
      color: "hsl(var(--chart-4))",
    },
  }

  const renderChart = (data: typeof data1D) => (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={stock.change >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={stock.change >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(value) => `${value.toFixed(0)}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />

            {/* Moving averages */}
            {showIndicators && (
              <>
                <Line
                  type="monotone"
                  dataKey="sma20"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="5 5"
                />
              </>
            )}

            {/* Price line/area */}
            {chartType === "area" && (
              <Area
                type="monotone"
                dataKey="price"
                stroke={stock.change >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"}
                strokeWidth={2.5}
                fill="url(#colorPrice)"
                animationDuration={1000}
              />
            )}
            {chartType === "line" && (
              <Line
                type="monotone"
                dataKey="price"
                stroke={stock.change >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"}
                strokeWidth={2.5}
                dot={false}
                animationDuration={1000}
              />
            )}
            {chartType === "candlestick" && (
              <Line
                type="monotone"
                dataKey="close"
                stroke={stock.change >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"}
                strokeWidth={2.5}
                dot={false}
                animationDuration={1000}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>

      {showVolume && (
        <ChartContainer config={chartConfig} className="h-[100px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="volume" fill="hsl(var(--muted-foreground))" opacity={0.3} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  )

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-foreground">RWF {stock.price.toFixed(2)}</p>
              <Badge variant={stock.change >= 0 ? "default" : "destructive"} className="gap-1">
                {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stock.change >= 0 ? "+" : ""}
                {stock.changePercent.toFixed(2)}%
              </Badge>
            </div>
            <p className={`text-sm font-medium mt-1 ${stock.change >= 0 ? "text-secondary" : "text-destructive"}`}>
              {stock.change >= 0 ? "+" : ""}
              {stock.change.toFixed(2)} today
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground mr-2">Chart Type:</span>
            <Button
              size="sm"
              variant={chartType === "area" ? "default" : "outline"}
              onClick={() => setChartType("area")}
              className="h-7 px-2 text-xs"
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Area
            </Button>
            <Button
              size="sm"
              variant={chartType === "line" ? "default" : "outline"}
              onClick={() => setChartType("line")}
              className="h-7 px-2 text-xs"
            >
              Line
            </Button>
            <Button
              size="sm"
              variant={chartType === "candlestick" ? "default" : "outline"}
              onClick={() => setChartType("candlestick")}
              className="h-7 px-2 text-xs"
            >
              <CandlestickChart className="w-3 h-3 mr-1" />
              Candle
            </Button>
          </div>
          
          <div className="h-4 w-px bg-border mx-2" />
          
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground mr-2">Options:</span>
            <Button
              size="sm"
              variant={showVolume ? "default" : "outline"}
              onClick={() => setShowVolume(!showVolume)}
              className="h-7 px-2 text-xs"
            >
              Volume
            </Button>
            <Button
              size="sm"
              variant={showIndicators ? "default" : "outline"}
              onClick={() => setShowIndicators(!showIndicators)}
              className="h-7 px-2 text-xs"
            >
              Indicators
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="1M" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="1D" className="transition-all">
            1D
          </TabsTrigger>
          <TabsTrigger value="1W" className="transition-all">
            1W
          </TabsTrigger>
          <TabsTrigger value="1M" className="transition-all">
            1M
          </TabsTrigger>
          <TabsTrigger value="3M" className="transition-all">
            3M
          </TabsTrigger>
        </TabsList>
        <TabsContent value="1D" className="mt-4">
          {renderChart(data1D)}
        </TabsContent>
        <TabsContent value="1W" className="mt-4">
          {renderChart(data1W)}
        </TabsContent>
        <TabsContent value="1M" className="mt-4">
          {renderChart(data1M)}
        </TabsContent>
        <TabsContent value="3M" className="mt-4">
          {renderChart(data3M)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
