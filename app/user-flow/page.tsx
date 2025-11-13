"use client"

import type React from "react"

import {
  ArrowRight,
  Users,
  User,
  TrendingUp,
  Trophy,
  Target,
  BookOpen,
  Zap,
  BarChart3,
  Newspaper,
  History,
  Star,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function UserFlowPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-5xl font-bold text-transparent">
            SHORA User Flow
          </h1>
          <p className="text-xl text-muted-foreground">
            Complete journey through Africa's premier stock trading simulator
          </p>
          <Link href="/" className="mt-4 inline-block text-sm text-primary hover:underline">
            ← Back to Platform
          </Link>
        </div>

        {/* Entry Point */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Entry Point</h2>
          </div>

          <Card className="mx-auto max-w-2xl border-2 border-primary/20 bg-card/50 p-8 backdrop-blur">
            <div className="text-center">
              <h3 className="mb-2 text-xl font-semibold">Landing Page</h3>
              <p className="mb-4 text-muted-foreground">
                Users arrive and see SHORA's value proposition with African-themed hero section
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
                  <User className="h-5 w-5 text-primary" />
                  <span className="font-medium">Individual Mode</span>
                </div>
                <span className="text-muted-foreground">or</span>
                <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2">
                  <Users className="h-5 w-5 text-accent" />
                  <span className="font-medium">Team Mode</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Split Flow */}
        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          {/* Individual Flow */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-primary">Individual User Flow</h2>
            </div>

            {/* Step 1: Dashboard */}
            <FlowCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="1. Dashboard Overview"
              description="View portfolio value, P&L, diversification chart, and top holdings"
              features={["Real-time portfolio tracking", "Performance metrics", "Asset allocation"]}
            />

            {/* Step 2: Market Overview */}
            <FlowCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="2. Market Overview"
              description="Monitor African market indices and overall market health"
              features={["Live market indices", "Market sentiment", "Economic indicators"]}
            />

            {/* Step 3: Trading */}
            <FlowCard
              icon={<Zap className="h-6 w-6" />}
              title="3. Trading Panel"
              description="Browse stocks, view charts, and execute trades with advanced order types"
              features={["Market/Limit/Stop-Loss orders", "Real-time charts with indicators", "Trade confirmations"]}
            />

            {/* Step 4: Watchlist */}
            <FlowCard
              icon={<Star className="h-6 w-6" />}
              title="4. Watchlist"
              description="Track favorite stocks and set price alerts"
              features={["Custom watchlists", "Price alerts", "Quick trade access"]}
            />

            {/* Step 5: News & History */}
            <FlowCard
              icon={<Newspaper className="h-6 w-6" />}
              title="5. News & History"
              description="Stay informed and review past trades"
              features={["Market news feed", "Trade history", "Performance analysis"]}
            />

            {/* Step 6: Gamification */}
            <FlowCard
              icon={<Trophy className="h-6 w-6" />}
              title="6. Gamification Hub"
              description="Level up, complete missions, and compete with others"
              features={["XP & Level system", "Daily streaks", "Power-ups", "Competitions"]}
            />

            {/* Step 7: Leaderboard */}
            <FlowCard
              icon={<Target className="h-6 w-6" />}
              title="7. Leaderboard"
              description="Compare performance with other traders"
              features={["Global rankings", "Performance metrics", "Achievement showcase"]}
            />
          </div>

          {/* Team Flow */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/60">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-accent">Team User Flow</h2>
            </div>

            {/* Step 1: Team Dashboard */}
            <FlowCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="1. Team Dashboard"
              description="View team portfolio, member contributions, and collective performance"
              features={["Team portfolio value", "Member contributions", "Team P&L"]}
              variant="team"
            />

            {/* Step 2: Collaborative Trading */}
            <FlowCard
              icon={<Zap className="h-6 w-6" />}
              title="2. Collaborative Trading"
              description="Team members can propose and execute trades together"
              features={["Shared trading panel", "Trade proposals", "Member voting"]}
              variant="team"
            />

            {/* Step 3: Team Activity */}
            <FlowCard
              icon={<History className="h-6 w-6" />}
              title="3. Team Activity Feed"
              description="See real-time actions from all team members"
              features={["Member trades", "Activity timeline", "Trade notifications"]}
              variant="team"
            />

            {/* Step 4: Team Leaderboard */}
            <FlowCard
              icon={<Trophy className="h-6 w-6" />}
              title="4. Team Leaderboard"
              description="Compete with other teams globally"
              features={["Team rankings", "Member count", "Team achievements"]}
              variant="team"
            />

            {/* Step 5: Team Gamification */}
            <FlowCard
              icon={<Target className="h-6 w-6" />}
              title="5. Team Achievements"
              description="Unlock team-specific achievements and missions"
              features={["Team missions", "Collective badges", "Team rewards"]}
              variant="team"
            />

            {/* Step 6: Team Analytics */}
            <FlowCard
              icon={<BookOpen className="h-6 w-6" />}
              title="6. Team Analytics"
              description="Analyze team performance and member contributions"
              features={["Performance breakdown", "Member stats", "Strategy insights"]}
              variant="team"
            />
          </div>
        </div>

        {/* Key Features Summary */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold">Core Platform Features</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Real-Time Trading"
              description="Live market data, instant trade execution, and professional charting tools"
            />
            <FeatureCard
              icon={<Trophy className="h-8 w-8" />}
              title="Gamification"
              description="XP system, achievements, daily streaks, power-ups, and competitions"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Social Learning"
              description="Team collaboration, leaderboards, and community-driven trading"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FlowCard({
  icon,
  title,
  description,
  features,
  variant = "individual",
}: {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  variant?: "individual" | "team"
}) {
  const borderColor = variant === "team" ? "border-accent/30" : "border-primary/30"
  const iconBg = variant === "team" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"

  return (
    <Card
      className={`border-2 ${borderColor} bg-card/50 p-6 backdrop-blur transition-all hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="mb-4 flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>{icon}</div>
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {variant === "individual" && (
        <div className="mt-4 flex justify-center">
          <ArrowRight className="h-5 w-5 text-primary/50" />
        </div>
      )}
      {variant === "team" && (
        <div className="mt-4 flex justify-center">
          <ArrowRight className="h-5 w-5 text-accent/50" />
        </div>
      )}
    </Card>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 p-6 text-center backdrop-blur transition-all hover:scale-105 hover:shadow-xl">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  )
}
