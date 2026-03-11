"use client"

import { motion, useReducedMotion } from "framer-motion"

import { BrandMark } from "@/components/shared/brand-mark"
import { cn } from "@/lib/utils"

interface BrandedPanelProps {
  animate?: boolean
  className?: string
}

export function BrandedPanel({ animate = false, className }: BrandedPanelProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={cn(
        "hidden lg:flex lg:w-1/2 xl:w-[45%] bg-primary relative overflow-hidden",
        className
      )}
    >
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

      <motion.div
        className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-white/10"
        animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 4, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
        }
      />
      <motion.div
        className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-white/10"
        animate={reduceMotion ? undefined : { scale: [1.06, 0.95, 1.06], opacity: [0.28, 0.5, 0.28] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 4.6, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
        }
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : animate
                ? { scale: [1, 1.1, 1], y: [0, -2, 0] }
                : { scale: 1, y: 0 }
          }
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <BrandMark size={80} priority animated={animate} />
        </motion.div>

        <motion.h1
          className="mt-8 text-3xl font-bold text-white text-center"
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          Zikel Solutions
        </motion.h1>

        <motion.p
          className="mt-4 text-lg text-white/80 text-center max-w-sm"
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          Zikel Care Documentation Platform
        </motion.p>

        <div className="mt-12 flex items-center gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={cn(
                "h-1 rounded-full bg-white/40",
                index === 0 ? "w-8" : index === 1 ? "w-4 bg-white/30" : "w-2 bg-white/20"
              )}
              animate={
                reduceMotion
                  ? undefined
                  : { opacity: [0.3, 0.95, 0.3], width: index === 0 ? [32, 36, 32] : undefined }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 1.2,
                      ease: "easeInOut",
                      repeat: Number.POSITIVE_INFINITY,
                      delay: index * 0.14,
                    }
              }
            />
          ))}
        </div>

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
    </div>
  )
}
