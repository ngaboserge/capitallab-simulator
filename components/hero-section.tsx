"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Trophy, Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 african-pattern animate-slide-up">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-secondary/10" />

      <CardContent className="relative z-10 p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Left: Text Content */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 animate-glow-pulse">
                <Sparkles className="w-3 h-3 mr-1" />
                Educational Platform
              </Badge>
              <Badge variant="outline" className="border-secondary/20 text-secondary">
                Live Simulation
              </Badge>
            </div>

            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-balance mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                SHORA Stock Market Simulator
              </h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                Master African stock markets through immersive, gamified trading. Learn, compete, and grow your
                financial literacy with real-time simulations of Rwandan and African companies.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 animate-float">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Live Trading</p>
                  <p className="text-xs text-muted-foreground">Real-time prices</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-secondary/10 animate-float" style={{ animationDelay: "0.2s" }}>
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Team Mode</p>
                  <p className="text-xs text-muted-foreground">Collaborate & compete</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent/10 animate-float" style={{ animationDelay: "0.4s" }}>
                  <Trophy className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Gamification</p>
                  <p className="text-xs text-muted-foreground">Earn badges & points</p>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="pt-4 space-y-3 border-t border-border animate-slide-up">
                <h3 className="text-sm font-semibold text-foreground">Key Features:</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Virtual RWF 100,000 starting balance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Trade Bank of Kigali, MTN Rwanda & more</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Real-time charts & portfolio tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Individual & team leaderboards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Achievements, missions & rewards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Educational resources & tutorials</span>
                  </li>
                </ul>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary hover:text-primary/80 hover:bg-primary/10 -ml-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Learn More
                </>
              )}
            </Button>
          </div>

          {/* Right: Visual Snapshot */}
          <div className="w-full lg:w-80 space-y-3">
            <div className="relative p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">Live Portfolio</span>
                <Badge variant="outline" className="text-xs animate-pulse">
                  Live
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold text-foreground">RWF 125,840</span>
                  <span className="text-sm font-semibold text-secondary">+25.84%</span>
                </div>
                <div className="h-16 flex items-end gap-1">
                  {[40, 55, 45, 60, 50, 70, 65, 80, 75, 85].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t animate-slide-up"
                      style={{
                        height: `${height}%`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border bg-card/50 backdrop-blur-sm card-hover">
                <p className="text-xs text-muted-foreground mb-1">Active Traders</p>
                <p className="text-xl font-bold text-foreground">1,247</p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card/50 backdrop-blur-sm card-hover">
                <p className="text-xs text-muted-foreground mb-1">Trades Today</p>
                <p className="text-xl font-bold text-foreground">8,932</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
