"use client"

import { useEffect, useState } from "react"
import { Trophy, Star, Sparkles } from "lucide-react"

interface LevelUpCelebrationProps {
  newLevel: number
  show: boolean
  onHide: () => void
}

export function LevelUpCelebration({ newLevel, show, onHide }: LevelUpCelebrationProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (show) {
      setAnimate(true)
      const timer = setTimeout(() => {
        setAnimate(false)
        setTimeout(onHide, 300) // Wait for fade out
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [show, onHide])

  if (!show) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
      animate ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-8 rounded-2xl shadow-2xl text-white text-center transform transition-all duration-500 ${
        animate ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
      }`}>
        {/* Celebration Icons */}
        <div className="relative mb-4">
          <Trophy className="w-16 h-16 mx-auto animate-bounce" />
          <Star className="w-6 h-6 absolute -top-2 -left-2 animate-spin text-yellow-300" />
          <Star className="w-4 h-4 absolute -bottom-1 -right-1 animate-pulse text-yellow-300" />
          <Sparkles className="w-5 h-5 absolute top-0 right-0 animate-ping text-yellow-200" />
        </div>

        {/* Level Up Text */}
        <h2 className="text-4xl font-bold mb-2 animate-pulse">
          LEVEL UP!
        </h2>
        <p className="text-2xl font-semibold mb-4">
          Level {newLevel}
        </p>
        
        {/* Celebration Message */}
        <div className="space-y-2">
          <p className="text-lg">🎉 Congratulations! 🎉</p>
          <p className="text-sm opacity-90">
            You've reached Level {newLevel}!
          </p>
          <p className="text-xs opacity-75">
            Keep trading to unlock more rewards!
          </p>
        </div>

        {/* Animated Border */}
        <div className="absolute inset-0 rounded-2xl border-4 border-yellow-300 animate-pulse"></div>
      </div>

      {/* Background Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`
            }}
          >
            ⭐
          </div>
        ))}
      </div>
    </div>
  )
}

// Hook to manage level up celebrations
export function useLevelUpCelebration() {
  const [celebration, setCelebration] = useState<{
    newLevel: number
    show: boolean
  }>({
    newLevel: 0,
    show: false
  })

  const showLevelUp = (newLevel: number) => {
    setCelebration({
      newLevel,
      show: true
    })
  }

  const hideCelebration = () => {
    setCelebration(prev => ({ ...prev, show: false }))
  }

  return {
    celebration,
    showLevelUp,
    hideCelebration
  }
}