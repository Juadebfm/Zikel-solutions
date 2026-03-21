"use client"

import { usePathname } from "next/navigation"
import { LanguageProvider } from "@/contexts/language-context"
import { LanguageSelector } from "@/components/auth/language-selector"
import { BrandedPanel } from "@/components/auth/branded-panel"
import { LEGAL_URLS, isExternalUrl } from "@/lib/config/legal"
import { BrandMark } from "@/components/shared/brand-mark"
import { cn } from "@/lib/utils"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isRegisterRoute = pathname === "/register"
  const termsUrl = LEGAL_URLS.terms
  const privacyUrl = LEGAL_URLS.privacy

  return (
    <LanguageProvider>
      <div
        className={cn(
          "min-h-screen flex",
          isRegisterRoute && "lg:h-[100dvh] lg:overflow-hidden"
        )}
      >
        {/* Left Panel - Form */}
        <div
          className={cn(
            "w-full lg:w-1/2 xl:w-[55%] flex flex-col bg-white relative",
            isRegisterRoute && "lg:h-full"
          )}
        >
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

          {/* Mobile Header: Logo (left) + Language (right) */}
          <div className="flex items-center justify-between px-6 sm:px-12 pt-4 lg:hidden relative z-20">
            <BrandMark size={36} priority className="rounded-lg overflow-hidden" />
            <LanguageSelector variant="outline" />
          </div>

          {/* Language Selector - Top Right (desktop only) */}
          <div className="absolute top-4 right-4 z-20 hidden lg:block">
            <LanguageSelector variant="outline" />
          </div>

          <div
            className={cn(
              "relative flex-1 flex flex-col",
              isRegisterRoute && "lg:min-h-0 lg:overflow-y-auto"
            )}
          >
            {/* Main Content */}
            <div
              className={cn(
                "relative flex-1 flex flex-col px-6 sm:px-12 lg:px-16 xl:px-20 py-6 lg:py-12 lg:pt-16",
                isRegisterRoute ? "justify-center lg:justify-start" : "justify-center"
              )}
            >
              {children}
            </div>

            {/* Footer */}
            <div className="relative px-6 sm:px-12 lg:px-16 xl:px-20 py-6 border-t border-gray-100 bg-white/80 backdrop-blur-sm lg:bg-white lg:backdrop-blur-none">
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                  <span className="text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} Zikel Solutions
                  </span>
                  <span className="text-gray-300 hidden md:inline">|</span>
                  <a
                    href="/help"
                    className="text-gray-500 hover:text-gray-700 text-xs hidden md:inline"
                  >
                    Help Center
                  </a>
                  <span className="text-gray-300 hidden md:inline">|</span>
                  {isExternalUrl(termsUrl) ? (
                    <a
                      href={termsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700 text-xs hidden md:inline"
                    >
                      Terms of Service
                    </a>
                  ) : (
                    <a
                      href={termsUrl}
                      className="text-gray-500 hover:text-gray-700 text-xs hidden md:inline"
                    >
                      Terms of Service
                    </a>
                  )}
                  <span className="text-gray-300 hidden md:inline">|</span>
                  {isExternalUrl(privacyUrl) ? (
                    <a
                      href={privacyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700 text-xs hidden md:inline"
                    >
                      Privacy Policy
                    </a>
                  ) : (
                    <a
                      href={privacyUrl}
                      className="text-gray-500 hover:text-gray-700 text-xs hidden md:inline"
                    >
                      Privacy Policy
                    </a>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Branded */}
        <BrandedPanel key={pathname} animate />
      </div>
    </LanguageProvider>
  )
}
