export default function DemoPracticePlannerLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Demo Banner Skeleton */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-80 mx-auto"></div>
        </div>
      </div>

      {/* Header Skeleton */}
      <div className="bg-white border-b px-4 py-3">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
            
            {/* Toolbar Skeleton */}
            <div className="flex items-center space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-9 w-9 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col space-y-4 p-4 overflow-y-auto">
          {/* Practice Info Header Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Duration Progress Bar Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </div>

          {/* Practice Timeline Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Drill Library Sidebar Skeleton - Desktop/Tablet */}
        <div className="hidden md:block w-80 lg:w-96 border-l bg-white overflow-y-auto">
          <div className="p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            
            {/* Search and filters */}
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded w-16"></div>
                ))}
              </div>
            </div>
            
            {/* Drill categories */}
            <div className="space-y-4">
              {[...Array(3)].map((_, categoryIndex) => (
                <div key={categoryIndex} className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="space-y-2">
                    {[...Array(3)].map((_, drillIndex) => (
                      <div key={drillIndex} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}