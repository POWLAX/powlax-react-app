export default function PracticePlannerDemoLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-80"></div>
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

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 p-4">
        {/* Main Content Skeleton */}
        <div className="flex-1 space-y-4">
          {/* Practice Info Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-48 mb-3"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
          </div>

          {/* Practice Schedule Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>

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

            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </div>

          {/* Practice Timeline Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
            
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>

            <div className="text-center py-8">
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
            </div>
          </div>
        </div>

        {/* Drill Library Sidebar Skeleton - Desktop/Tablet */}
        <div className="hidden lg:block w-80 xl:w-96">
          <div className="bg-white rounded-lg shadow-sm border h-full overflow-hidden">
            <div className="p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              
              {/* Search Bar */}
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded w-16"></div>
                ))}
              </div>
              
              {/* Drill Cards */}
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}