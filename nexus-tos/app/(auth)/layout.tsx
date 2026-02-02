"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { LanguageProvider } from "@/contexts/language-context"
import { LanguageSelector } from "@/components/auth/language-selector"
import { BrandedPanel } from "@/components/auth/branded-panel"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [animate, setAnimate] = useState(false)
  const [prevPathname, setPrevPathname] = useState(pathname)

  // Trigger animation on route change
  useEffect(() => {
    if (pathname !== prevPathname) {
      setAnimate(true)
      setPrevPathname(pathname)
      const timer = setTimeout(() => setAnimate(false), 500)
      return () => clearTimeout(timer)
    }
  }, [pathname, prevPathname])

  return (
    <LanguageProvider>
      <div className="min-h-screen flex">
        {/* Left Panel - Form */}
        <div className="w-full lg:w-1/2 xl:w-[55%] flex flex-col bg-white relative">
          {/* Mesh pattern - only visible on small screens */}
          <div
            className="absolute inset-0 lg:hidden"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(232,93,4,0.06) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(232,93,4,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />

          {/* Language Selector - Top Right */}
          <div className="absolute top-4 right-4 z-20">
            <LanguageSelector variant="outline" />
          </div>

          {/* Main Content */}
          <div className="relative flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-12 pt-16">
            {children}
          </div>

          {/* Footer */}
          <div className="relative px-6 sm:px-12 lg:px-16 xl:px-20 py-6 border-t border-gray-100 bg-white/80 backdrop-blur-sm lg:bg-white lg:backdrop-blur-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">
                  &copy; {new Date().getFullYear()} Zikel Solutions
                </span>
                <span className="text-gray-300">|</span>
                <a
                  href="/help"
                  className="text-gray-500 hover:text-gray-700 text-xs"
                >
                  Help Center
                </a>
                <span className="text-gray-300">|</span>
                <a
                  href="/terms"
                  className="text-gray-500 hover:text-gray-700 text-xs"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Branded */}
        <BrandedPanel animate={animate} />
      </div>
    </LanguageProvider>
  )
}
