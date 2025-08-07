export default function RoleManagementLoading() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-48"></div>
        </div>
      </div>

      {/* Permissions Card Skeleton */}
      <div className="bg-white border rounded-lg p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>

      {/* Filters Card Skeleton */}
      <div className="bg-white border rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Users Table Skeleton */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-6 animate-pulse">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 mb-4 pb-2 border-b">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
          
          {/* Table Rows */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 py-4 border-b border-gray-100">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-28"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}