export function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-9 w-80 bg-gray-200 rounded-lg mb-2" />
        <div className="h-5 w-64 bg-gray-200 rounded-lg" />
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
                <div className="h-10 w-16 bg-gray-200 rounded-lg" />
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-3 w-14 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Division Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                <div className="h-10 w-12 bg-gray-200 rounded-lg" />
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-3 w-14 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-3/4 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArchiveTableSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-200 rounded-xl" />
            <div className="h-7 w-40 bg-gray-200 rounded-lg" />
          </div>
          <div className="h-4 w-64 bg-gray-100 rounded ml-12" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 bg-gray-200 rounded-xl" />
          <div className="h-10 w-28 bg-gray-200 rounded-xl" />
          <div className="h-10 w-36 bg-blue-100 rounded-xl" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-28 bg-gray-200 rounded-xl" />
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-3">
          <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
          <div className="h-10 w-36 bg-gray-100 rounded-xl" />
          <div className="h-10 w-32 bg-gray-100 rounded-xl" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-50">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="h-4 w-20 bg-gray-100 rounded" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-gray-200 rounded mb-1.5" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
              <div className="h-6 w-20 bg-gray-100 rounded-lg" />
              <div className="h-6 w-16 bg-gray-100 rounded-lg" />
              <div className="flex gap-1">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="w-8 h-8 bg-gray-100 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-8 h-8 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
          <div className="h-8 w-44 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-5 w-72 bg-gray-100 rounded ml-12" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="h-4 w-28 bg-gray-200 rounded mb-3" />
            <div className="h-10 w-16 bg-gray-200 rounded-lg mb-2" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="h-6 w-36 bg-gray-200 rounded mb-6" />
          <div className="flex items-end gap-4 h-48">
            {[40, 65, 50, 80, 55, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-gray-100 rounded-t-lg" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="h-6 w-28 bg-gray-200 rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-full bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
