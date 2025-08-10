'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface FilterStrategiesModalProps {
  isOpen: boolean
  onClose: () => void
  availableCategories: string[]
  selectedCategories: string[]
  onApplyFilters: (categories: string[]) => void
}

export default function FilterStrategiesModal({
  isOpen,
  onClose,
  availableCategories,
  selectedCategories,
  onApplyFilters
}: FilterStrategiesModalProps) {
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>(selectedCategories)

  useEffect(() => {
    setTempSelectedCategories(selectedCategories)
  }, [selectedCategories])

  const handleCategoryToggle = (category: string) => {
    if (tempSelectedCategories.includes(category)) {
      setTempSelectedCategories(tempSelectedCategories.filter(c => c !== category))
    } else {
      setTempSelectedCategories([...tempSelectedCategories, category])
    }
  }

  const handleApply = () => {
    onApplyFilters(tempSelectedCategories)
    onClose()
  }

  const handleClear = () => {
    setTempSelectedCategories([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Filter Strategies
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Categories */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-2">Strategy Categories</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableCategories.map(category => (
                <label
                  key={category}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={tempSelectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={tempSelectedCategories.length === 0}
            >
              Clear All
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleApply}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}