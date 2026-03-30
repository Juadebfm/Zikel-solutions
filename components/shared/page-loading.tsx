"use client"

import { motion, useReducedMotion } from "framer-motion"

import { BrandMark } from "@/components/shared/brand-mark"
import { cn } from "@/lib/utils"

interface PageLoadingProps {
  message?: string
  fullscreen?: boolean
}

export function PageLoading({
  message = "Loading Zikel...",
  fullscreen = false,
}: PageLoadingProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white",
        fullscreen ? "min-h-screen w-full" : "rounded-2xl border border-gray-100 py-20"
      )}
    >
      <div className={cn(
        "relative z-10 flex flex-col items-center justify-center px-6 text-center",
        fullscreen ? "min-h-screen" : "min-h-[320px]"
      )}>
        {/* Logo with subtle pulse */}
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          <BrandMark size={56} priority animated={false} />
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="w-48 h-1 rounded-full bg-gray-100 overflow-hidden"
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ x: "-100%" }}
            animate={
              reduceMotion
                ? { x: "0%" }
                : { x: ["-100%", "100%"] }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 1.4,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                  }
            }
          />
        </motion.div>

        {/* Message */}
        <motion.p
          className="mt-5 text-sm font-medium text-gray-400"
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          {message}
        </motion.p>
      </div>
    </div>
  )
}
