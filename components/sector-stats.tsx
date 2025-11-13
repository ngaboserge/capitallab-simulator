"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const sectors = [
  { name: "Banking & Finance", allocation: 35, performance: 12.5, color: "bg-chart-1" },
  { name: "Telecommunications", allocation: 25, performance: 8.3, color: "bg-chart-2" },
  { name: "Agriculture", allocation: 20, performance: 15.7, color: "bg-chart-3" },
  { name: "Technology", allocation: 20, performance: 22.1, color: "bg-chart-4" },
]

export function SectorStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Sector Performance</CardTitle>
        <p className="text-sm text-muted-foreground">Portfolio allocation and returns by sector</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {sectors.map((sector) => (
          <div key={sector.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${sector.color}`} />
                <span className="text-sm font-medium text-foreground">{sector.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{sector.allocation}%</span>
                <span
                  className={`text-sm font-medium ${sector.performance >= 0 ? "text-secondary" : "text-destructive"}`}
                >
                  +{sector.performance}%
                </span>
              </div>
            </div>
            <Progress value={sector.allocation} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
