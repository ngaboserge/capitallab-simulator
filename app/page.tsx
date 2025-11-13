"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Users, TrendingUp, Trophy, ArrowRight, BookOpen, Building2, Shield, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border h-[500px]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/african-business-professionals-modern-office-tradi.jpg')`,
          }}
        />
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/80" />
        {/* Pattern Overlay */}
        <div className="absolute inset-0 african-pattern opacity-30" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 h-full flex items-center justify-center text-center">
          <div className="space-y-6 animate-slide-up">
            <Badge className="bg-primary/10 text-primary border-primary/20 animate-glow-pulse">
              Africa's Stock Market Simulator
            </Badge>

            <div className="flex justify-center py-4">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-6">
                <div className="w-auto h-28 lg:h-32 flex items-center justify-center text-gradient text-4xl lg:text-5xl font-bold">
                  SHORA Markets
                </div>
              </div>
            </div>

            <p className="text-xl lg:text-2xl text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
              Learn stock trading with African companies. Gamified, risk-free, and built for growth.
            </p>
          </div>
        </div>
      </div>

      {/* Selection Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {/* Section Header */}
          <div className="text-center space-y-4 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Choose Your Trading Path</h2>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
              Whether you prefer solo trading or collaborative team strategies, SHORA has the perfect experience for you.
            </p>
          </div>

          {/* Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {/* Individual Card */}
            <Card className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 card-hover african-pattern group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 group-hover:from-primary/20 transition-all duration-300" />
              <CardContent className="relative z-10 p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 animate-float">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <Badge variant="outline" className="border-primary/20 text-primary">
                    Solo Trading
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-foreground">Individual Trader</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Trade independently with your own portfolio. Perfect for learning at your own pace and competing on individual leaderboards.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">RWF 100,000 starting balance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Personal achievements & badges</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Individual leaderboard ranking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Real-time market data</span>
                  </div>
                </div>

                <Button
                  onClick={() => router.push("/individual")}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group/btn"
                  size="lg"
                >
                  Start Trading Solo
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* Team Card */}
            <Card className="relative overflow-hidden border-2 border-secondary/20 hover:border-secondary/40 transition-all duration-300 card-hover african-pattern group">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-secondary/5 group-hover:from-secondary/20 transition-all duration-300" />
              <CardContent className="relative z-10 p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div
                    className="p-4 rounded-2xl bg-secondary/10 group-hover:bg-secondary/20 transition-all duration-300 animate-float"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <Users className="w-8 h-8 text-secondary" />
                  </div>
                  <Badge variant="outline" className="border-secondary/20 text-secondary">
                    Collaborative
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-foreground">Team Trading</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Collaborate with teammates to build a shared portfolio. Compete against other teams and learn together.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="text-muted-foreground">Shared team portfolio & balance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="text-muted-foreground">Team achievements & missions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="text-muted-foreground">Team leaderboard ranking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="text-muted-foreground">Collaborative decision making</span>
                  </div>
                </div>

                <Button
                  onClick={() => router.push("/team")}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground group/btn"
                  size="lg"
                >
                  Join Team Trading
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>



          {/* Stats Footer */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm card-hover">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-2xl font-bold text-foreground">1,247</p>
              </div>
              <p className="text-xs text-muted-foreground">Active Traders</p>
            </div>
            <div className="text-center p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm card-hover">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-4 h-4 text-secondary" />
                <p className="text-2xl font-bold text-foreground">89</p>
              </div>
              <p className="text-xs text-muted-foreground">Teams</p>
            </div>
            <div className="text-center p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm card-hover">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-accent" />
                <p className="text-2xl font-bold text-foreground">8.9K</p>
              </div>
              <p className="text-xs text-muted-foreground">Trades Today</p>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          {/* Section Header */}
          <div className="text-center space-y-4 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">CapitalLab Educational Platform</h2>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
              Master Rwanda's capital markets through comprehensive education and institutional role simulation.
            </p>
          </div>

          {/* Educational Features Overview */}
          <div className="african-grid slide-up" style={{ animationDelay: "0.2s" }}>
            {/* Learn Concepts */}
            <div className="trading-card card-hover african-pattern text-center">
              <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto mb-4 float">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gradient">Learn Concepts</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Understand capital markets fundamentals and Rwanda's institutional framework
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• What are capital markets?</li>
                <li>• CMA, RSE & CSD roles</li>
                <li>• Real-world examples</li>
              </ul>
            </div>

            {/* Follow Process */}
            <div className="trading-card card-hover african-pattern text-center">
              <div className="p-4 rounded-2xl bg-secondary/10 w-fit mx-auto mb-4 float" style={{ animationDelay: "0.5s" }}>
                <TrendingUp className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gradient">Follow Process</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Step-by-step capital raising journey from business idea to market listing
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 7-step capital raising process</li>
                <li>• Interactive tutorials</li>
                <li>• Regulatory approval simulation</li>
              </ul>
            </div>

            {/* Explore Roles */}
            <div className="trading-card card-hover african-pattern text-center">
              <div className="p-4 rounded-2xl bg-accent/10 w-fit mx-auto mb-4 float" style={{ animationDelay: "1s" }}>
                <Building2 className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gradient">Explore Roles</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Experience 8 institutional perspectives in Rwanda's capital markets
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Issuers, IB Advisors, Brokers</li>
                <li>• Regulators, Investors, CSD</li>
                <li>• Professional workflows</li>
              </ul>
            </div>
          </div>

          {/* CapitalLab - Featured Educational Platform */}
          <div className="text-center space-y-8 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="p-10 rounded-2xl bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 shadow-xl">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-sm px-4 py-1">
                    🎓 NEW: Educational Platform
                  </Badge>
                  <h3 className="text-3xl lg:text-4xl font-bold text-foreground">
                    CapitalLab: Learn Rwanda's Capital Markets
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Master how businesses raise capital in Rwanda through our comprehensive educational platform. 
                    Learn the complete journey from business idea to stock exchange listing.
                  </p>
                </div>

                {/* Educational Journey */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
                  <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Learn Concepts</div>
                        <div className="text-xs text-muted-foreground">Understand capital markets basics</div>
                      </div>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• What are capital markets?</li>
                      <li>• CMA, RSE & CSD roles</li>
                      <li>• Real-world examples</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Follow Process</div>
                        <div className="text-xs text-muted-foreground">7-step capital raising journey</div>
                      </div>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Business intent to listing</li>
                      <li>• Regulatory approval process</li>
                      <li>• Interactive tutorials</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Explore Roles</div>
                        <div className="text-xs text-muted-foreground">8 institutional perspectives</div>
                      </div>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Issuers, IB Advisors, Brokers</li>
                      <li>• Regulators, Investors</li>
                      <li>• Professional workflows</li>
                    </ul>
                  </div>
                </div>

                {/* Main CTA for CapitalLab */}
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Button
                      onClick={() => router.push("/capitallab")}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                      size="lg"
                    >
                      Explore CapitalLab
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Perfect for students, professionals, and business owners
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Journey */}
          <div className="text-center space-y-6 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <div className="p-8 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">
                  Your Learning Journey
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Progress from basic concepts to advanced institutional role mastery in Rwanda's capital markets.
                </p>

                {/* Learning Path Visualization */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-semibold text-sm">Learn Concepts</div>
                      <div className="text-xs text-muted-foreground">Capital markets basics</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber-500 hidden sm:block" />
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-semibold text-sm">Follow Process</div>
                      <div className="text-xs text-muted-foreground">7-step journey</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber-500 hidden sm:block" />
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <div className="text-left">
                      <div className="font-semibold text-sm">Master Roles</div>
                      <div className="text-xs text-muted-foreground">8 institutions</div>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>



          {/* Stats Footer */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <div className="text-center p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm card-hover">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <p className="text-2xl font-bold text-foreground">2,847</p>
              </div>
              <p className="text-xs text-muted-foreground">Students Learning</p>
            </div>
            <div className="text-center p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm card-hover">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-secondary" />
                <p className="text-2xl font-bold text-foreground">8</p>
              </div>
              <p className="text-xs text-muted-foreground">Institutional Roles</p>
            </div>
            <div className="text-center p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm card-hover">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-4 h-4 text-accent" />
                <p className="text-2xl font-bold text-foreground">156</p>
              </div>
              <p className="text-xs text-muted-foreground">Completed Workflows</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}