"use client"

import Script from "next/script"
import { useCallback, useEffect, useRef, useState } from "react"

interface TurnstileCaptchaProps {
  token: string | null
  onTokenChange: (token: string | null) => void
  className?: string
  size?: "normal" | "compact"
  resetSignal?: number
}

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script"
const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

export function TurnstileCaptcha({
  token,
  onTokenChange,
  className,
  size = "normal",
  resetSignal = 0,
}: TurnstileCaptchaProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const renderWidget = useCallback(() => {
    if (!siteKey || !scriptLoaded || !window.turnstile || !containerRef.current) {
      return
    }

    if (widgetIdRef.current) {
      return
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      size,
      theme: "light",
      callback: (nextToken) => onTokenChange(nextToken),
      "expired-callback": () => onTokenChange(null),
      "error-callback": () => onTokenChange(null),
    })
  }, [onTokenChange, scriptLoaded, siteKey, size])

  useEffect(() => {
    renderWidget()

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [renderWidget])

  useEffect(() => {
    if (!widgetIdRef.current || !window.turnstile) {
      return
    }

    window.turnstile.reset(widgetIdRef.current)
    onTokenChange(null)
  }, [onTokenChange, resetSignal])

  if (!siteKey) {
    return (
      <div className={className}>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          Security verification is not configured for this environment.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <Script
        id={TURNSTILE_SCRIPT_ID}
        src={TURNSTILE_SCRIPT_SRC}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} />
      {!token && (
        <p className="text-xs text-gray-500 mt-2">
          Complete the security verification before submitting.
        </p>
      )}
    </div>
  )
}
