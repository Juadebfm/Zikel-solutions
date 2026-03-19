export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="h-7 w-56 rounded bg-gray-200" />
        <div className="h-4 w-72 rounded bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`stat-${index}`}
            className="h-28 rounded-xl border border-gray-100 bg-white"
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-96 rounded-xl border border-gray-100 bg-white" />
        <div className="h-96 rounded-xl border border-gray-100 bg-white" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 rounded-xl border border-gray-100 bg-white" />
        <div className="h-64 rounded-xl border border-gray-100 bg-white" />
      </div>
    </div>
  )
}
