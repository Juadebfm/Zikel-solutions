import Link from "next/link"
import { Construction } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
        <Construction className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-5xl font-bold text-primary">404</h1>
      <h2 className="mt-3 text-xl font-semibold text-gray-900">
        Page Not Found
      </h2>
      <p className="mt-3 text-gray-500 text-center max-w-sm leading-relaxed">
        This page is currently being engineered. Please be patient and check
        back later.
      </p>
      <Link
        href="/my-summary"
        className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
      >
        Back To Dashboard
      </Link>
    </div>
  )
}
