const FALLBACK_TERMS_PATH = "/terms"
const FALLBACK_PRIVACY_PATH = "/privacy"

function resolveLegalUrl(rawUrl: string | undefined, fallbackPath: string): string {
  const trimmed = rawUrl?.trim()
  return trimmed ? trimmed : fallbackPath
}

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

export const LEGAL_URLS = {
  terms: resolveLegalUrl(process.env.NEXT_PUBLIC_TERMS_URL, FALLBACK_TERMS_PATH),
  privacy: resolveLegalUrl(process.env.NEXT_PUBLIC_PRIVACY_URL, FALLBACK_PRIVACY_PATH),
}
