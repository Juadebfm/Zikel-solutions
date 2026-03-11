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
        "relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50",
        fullscreen ? "min-h-screen w-full" : "rounded-2xl border border-orange-100 py-20"
      )}
    >
      <motion.div
        className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-orange-200/50 blur-3xl"
        animate={reduceMotion ? undefined : { scale: [1, 1.1, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 4, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
        }
      />
      <motion.div
        className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-amber-200/45 blur-3xl"
        animate={reduceMotion ? undefined : { scale: [1.08, 0.95, 1.08], opacity: [0.3, 0.55, 0.3] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 5, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
        }
      />

      <div className="relative z-10 flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-2xl border border-orange-200/70 bg-white/80 p-5 shadow-lg backdrop-blur"
        >
          <BrandMark size={72} priority animated />
        </motion.div>

        <motion.h2
          className="mt-6 text-2xl font-bold text-zikel-dark"
          initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
        >
          Zikel Solutions
        </motion.h2>

        <motion.p
          className="mt-2 text-sm text-zikel-dark/70"
          initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14, ease: "easeOut" }}
        >
          {message}
        </motion.p>

        <div className="mt-6 flex items-center gap-2">
          {[0, 1, 2].map((index) => (
            <motion.span
              // Dot animation creates visible loader progress without spinning text.
              key={index}
              className="h-2 w-2 rounded-full bg-primary"
              animate={
                reduceMotion
                  ? { opacity: 0.6 }
                  : {
                      y: [0, -5, 0],
                      opacity: [0.35, 1, 0.35],
                      scale: [1, 1.12, 1],
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 0.9,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: index * 0.12,
                    }
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
