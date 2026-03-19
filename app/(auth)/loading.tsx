export default function AuthLoading() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="space-y-5 animate-pulse">
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-7 w-56 rounded bg-gray-200" />
          </div>
          <div className="h-12 w-full rounded-lg bg-gray-100" />
          <div className="h-12 w-full rounded-lg bg-gray-100" />
          <div className="h-12 w-full rounded-lg bg-gray-100" />
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-gray-500">
          <div className="h-5 w-5 rounded-full border-2 border-primary/25 border-t-primary animate-spin" />
          <span>Loading secure access...</span>
        </div>
      </div>
    </div>
  )
}
