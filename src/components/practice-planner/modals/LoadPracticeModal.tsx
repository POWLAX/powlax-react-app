'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FolderOpen, Calendar, Clock, Loader2, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { formatDistanceToNow } from 'date-fns'

interface PracticePlan {
  id: string
  title: string
  practice_date: string
  duration_minutes: number
  drill_sequence: any
  notes?: string
  created_at: string
  updated_at: string
}

interface LoadPracticeModalProps {
  isOpen: boolean
  onClose: () => void
  onLoad: (plan: PracticePlan) => void
  plans: PracticePlan[]
  loading: boolean
}

export default function LoadPracticeModal({ 
  isOpen, 
  onClose, 
  onLoad,
  plans,
  loading
}: LoadPracticeModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<PracticePlan | null>(null)

  const filteredPlans = plans.filter(plan => 
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plan.notes && plan.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleLoad = () => {
    if (selectedPlan) {
      onLoad(selectedPlan)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#003366]">
            <FolderOpen className="h-5 w-5" />
            Load Practice Plan
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Select a practice plan to load
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search practice plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 text-[#003366] placeholder:text-gray-400"
            />
          </div>

          {/* Practice Plans List */}
          <ScrollArea className="h-[300px] rounded-md border border-gray-300 bg-white">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FolderOpen className="h-12 w-12 mb-2" />
                <p>No practice plans found</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {filteredPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedPlan?.id === plan.id
                        ? 'border-[#003366] bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-[#003366]">{plan.title}</h4>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(plan.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(plan.practice_date).toLocaleDateString()}
                      </span>
                      {plan.drill_sequence?.timeSlots && plan.drill_sequence.timeSlots.length > 0 && (
                        <>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {plan.drill_sequence.timeSlots.reduce((total: number, slot: any) => 
                              total + (slot.duration || 0), 0
                            )} min
                          </span>
                          <span>
                            {plan.drill_sequence.timeSlots.length} drills
                          </span>
                        </>
                      )}
                    </div>
                    
                    {plan.notes && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {plan.notes}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-[#003366] border-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={handleLoad}
              disabled={!selectedPlan}
              className="bg-[#003366] hover:bg-[#003366]/90 text-white"
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Load Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}