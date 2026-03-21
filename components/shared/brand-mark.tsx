"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

interface BrandMarkProps {
  size?: number
  className?: string
  imageClassName?: string
  priority?: boolean
  animated?: boolean
}

const Z_ROTATION_DEG = 90

export function BrandMark({
  size = 48,
  className,
  imageClassName,
  priority = false,
  animated = false,
}: BrandMarkProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={cn("inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      animate={
        animated && !reduceMotion
          ? {
              rotate: [Z_ROTATION_DEG, Z_ROTATION_DEG + 4, Z_ROTATION_DEG - 3, Z_ROTATION_DEG],
              y: [0, -2, 0],
              scale: [1, 1.04, 1],
            }
          : {
              rotate: Z_ROTATION_DEG,
              y: 0,
              scale: 1,
            }
      }
      transition={
        animated && !reduceMotion
          ? {
              duration: 2.4,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
            }
          : {
              duration: 0.2,
            }
      }
    >
      <Image
        src="/favicon.png"
        alt="Zikel Solutions"
        width={size}
        height={size}
        className={cn("rounded-lg", imageClassName)}
        priority={priority}
      />
    </motion.div>
  )
}
