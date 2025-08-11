export default function PracticePlansLoading() {
  return (
    <div className="flex flex-col h-full">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Practice Info Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-48 mb-3"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
          </div>

          {/* Practice Schedule Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            
            {/* Form Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>

            {/* Duration Controls Skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>

            {/* Duration Bar Skeleton */}
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
        <div className="hidden md:block w-80 lg:w-96 border-l bg-white">
          <div className="p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            
            {/* Search Bar Skeleton */}
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            
            {/* Filter Buttons Skeleton */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded w-16"></div>
              ))}
            </div>
            
            {/* Drill Cards Skeleton */}
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}