"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandedPanelProps {
  animate?: boolean
  className?: string
}

export function BrandedPanel({ animate = false, className }: BrandedPanelProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  // Trigger animation when animate prop changes to true
  useEffect(() => {
    if (animate) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [animate])

  return (
    <div
      className={cn(
        "hidden lg:flex lg:w-1/2 xl:w-[45%] bg-primary relative overflow-hidden",
        className
      )}
    >
      {/* Mesh Pattern Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
        {/* Logo with Animation */}
        <div
          className={cn(
            "transition-transform duration-500 ease-out",
            isAnimating && "scale-110"
          )}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <Image
              src="/favicon.png"
              alt="Zikel Solutions"
              width={80}
              height={80}
              className="rounded-xl"
              priority
            />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="mt-8 text-3xl font-bold text-white text-center">
          Zikel Solutions
        </h1>

        {/* Tagline */}
        <p className="mt-4 text-lg text-white/80 text-center max-w-sm">
          Nexus Therapeutic Operating System
        </p>

        {/* Decorative Elements */}
        <div className="mt-12 flex items-center gap-2">
          <div className="w-8 h-1 bg-white/40 rounded-full" />
          <div className="w-4 h-1 bg-white/30 rounded-full" />
          <div className="w-2 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Bottom Decoration */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="flex items-center gap-6 text-white/50 text-sm">
            <span>Secure</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Compliant</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Reliable</span>
          </div>
        </div>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-tr-full" />
    </div>
  )
}
