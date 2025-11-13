"use client"

import { Trophy, Coins, Sparkles, User, Users, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AchievementsPanel } from "@/components/achievements-panel"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useGamification } from "@/contexts/gamification-context"

interface HeaderProps {
  mode?: "individual" | "team"
}

export function Header({ mode }: HeaderProps) {
  const router = useRouter()
  const gamification = useGamification()
  
  // Get current XP based on mode
  const currentXP = mode === "team" 
    ? gamification.teamGamification?.xp || 0
    : gamification.userGamification?.xp || 0

  return (
    <header className="border-b border-border bg-card/95 sticky top-0 z-50 backdrop-blur-md african-pattern">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/shora-logo.png"
              alt="SHORA Markets"
              width={180}
              height={50}
              className="h-10 w-auto cursor-pointer"
              onClick={() => router.push("/")}
            />
            {mode && (
              <Badge
                variant="outline"
                className={mode === "team" ? "border-secondary/20 text-secondary" : "border-primary/20 text-primary"}
              >
                {mode === "team" ? <Users className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                {mode === "team" ? "Team Mode" : "Individual"}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 card-hover">
              <Coins className="w-4 h-4 text-primary animate-float" />
              <span className="text-sm font-medium text-foreground">{currentXP.toLocaleString()} XP</span>
              <Sparkles className="w-3 h-3 text-primary" />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent btn-micro card-hover">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Achievements</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto animate-scale-in">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Achievements & Missions</DialogTitle>
                </DialogHeader>
                <AchievementsPanel mode={mode} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  )
}
