'use client'

import { useEffect, useState, useRef } from 'react'
import { X, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Button } from '@/components/ui/button'

export default function TourOverlay() {
  const { currentTour, currentStepIndex, nextStep, prevStep, skipTour, completeTour } = useOnboarding()
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const currentStep = currentTour?.steps[currentStepIndex]

  useEffect(() => {
    if (!currentStep) return

    const updatePosition = () => {
      const targetElement = document.querySelector(currentStep.target) as HTMLElement
      if (!targetElement) return

      const rect = targetElement.getBoundingClientRect()
      setTargetRect(rect)

      let top = 0
      let left = 0

      switch (currentStep.placement) {
        case 'top':
          top = rect.top - 120
          left = rect.left + rect.width / 2 - 150
          break
        case 'bottom':
          top = rect.bottom + 20
          left = rect.left + rect.width / 2 - 150
          break
        case 'left':
          top = rect.top + rect.height / 2 - 75
          left = rect.left - 320
          break
        case 'right':
          top = rect.top + rect.height / 2 - 75
          left = rect.right + 20
          break
      }

      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const tooltipWidth = 300
      const tooltipHeight = 150

      if (left < 10) left = 10
      if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10
      if (top < 10) top = 10
      if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10

      setTooltipPosition({ top, left })
    }

    updatePosition()
    
    // Update position on scroll and resize
    window.addEventListener('scroll', updatePosition)
    window.addEventListener('resize', updatePosition)
    
    // Add highlight to target element
    const targetElement = document.querySelector(currentStep.target) as HTMLElement
    if (targetElement) {
      targetElement.classList.add('tour-highlight')
    }

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
      
      // Remove highlight
      if (targetElement) {
        targetElement.classList.remove('tour-highlight')
      }
    }
  }, [currentStep])

  if (!currentTour || !currentStep) return null

  const isLastStep = currentStepIndex === currentTour.steps.length - 1

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Backdrop with cutout for highlighted element */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Highlighted area */}
      {targetRect && (
        <div
          className="absolute bg-transparent border-4 border-blue-500 rounded-lg shadow-lg animate-pulse"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
          }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence>
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute bg-white rounded-xl shadow-2xl p-6 pointer-events-auto max-w-sm z-10"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left
          }}
        >
          {/* Arrow pointing to target */}
          <div
            className="absolute w-4 h-4 bg-white transform rotate-45 border"
            style={{
              [currentStep.placement === 'top' ? 'bottom' : 
               currentStep.placement === 'bottom' ? 'top' :
               currentStep.placement === 'left' ? 'right' : 'left']: '-8px',
              [currentStep.placement === 'top' || currentStep.placement === 'bottom' ? 'left' : 'top']: '50%',
              transform: currentStep.placement === 'top' || currentStep.placement === 'bottom' 
                ? 'translateX(-50%) rotate(45deg)' 
                : 'translateY(-50%) rotate(45deg)',
              borderColor: currentStep.placement === 'top' ? 'transparent transparent #e5e7eb #e5e7eb' :
                          currentStep.placement === 'bottom' ? '#e5e7eb #e5e7eb transparent transparent' :
                          currentStep.placement === 'left' ? 'transparent #e5e7eb #e5e7eb transparent' :
                          '#e5e7eb transparent transparent #e5e7eb'
            }}
          />

          {/* Close button */}
          <button
            onClick={skipTour}
            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="pr-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentStep.title}</h3>
            <p className="text-gray-600 mb-4">{currentStep.content}</p>

            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-1">
                {currentTour.steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStepIndex ? 'bg-blue-600' : 
                      index < currentStepIndex ? 'bg-blue-300' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {currentStepIndex + 1} of {currentTour.steps.length}
              </span>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              <div>
                {currentStep.showPrevious && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  className="text-gray-500"
                >
                  Skip Tour
                </Button>
                
                {currentStep.showNext ? (
                  <Button
                    size="sm"
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLastStep ? 'Complete' : 'Next'}
                    {!isLastStep && <ArrowRight className="h-4 w-4 ml-1" />}
                    {isLastStep && <CheckCircle className="h-4 w-4 ml-1" />}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={completeTour}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete Tour
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* CSS for highlighted element */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 9998;
        }
      `}</style>
    </div>
  )
}