'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface QuickAccessCardProps {
  title: string
  count: number | string
  url: string
  icon?: React.ReactNode
}

export function QuickAccessCard({ title, count, url, icon }: QuickAccessCardProps) {
  return (
    <Link href={url}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="text-blue-600">
                {icon}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{title}</p>
              <p className="text-2xl font-bold text-gray-700 mt-1">{count}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </Link>
  )
}