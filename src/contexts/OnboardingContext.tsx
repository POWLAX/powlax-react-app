'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface TourStep {
  id: string
  title: string
  content: string
  target: string
  placement: 'top' | 'bottom' | 'left' | 'right'
  showNext: boolean
  showPrevious: boolean
}

interface OnboardingTour {
  id: string
  name: string
  role: 'coach' | 'player' | 'parent' | 'all'
  steps: TourStep[]
}

interface OnboardingContextType {
  currentTour: OnboardingTour | null
  currentStepIndex: number
  isOnboarding: boolean
  startTour: (tourId: string) => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  completeTour: () => void
  hasCompletedTour: (tourId: string) => boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const tours: OnboardingTour[] = [
  {
    id: 'coach-welcome',
    name: 'Coach Welcome Tour',
    role: 'coach',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to POWLAX!',
        content: "Let's take a quick tour of the features that will help you plan better practices and develop better players.",
        target: '.sidebar-logo',
        placement: 'right',
        showNext: true,
        showPrevious: false
      },
      {
        id: 'search',
        title: 'Quick Search',
        content: 'Use the search bar to quickly find drills, strategies, and workouts. Try pressing Cmd+K (or Ctrl+K) for keyboard shortcut.',
        target: '.search-trigger',
        placement: 'bottom',
        showNext: true,
        showPrevious: true
      },
      {
        id: 'practice-planner',
        title: 'Practice Planner',
        content: 'This is where the magic happens! Plan your practices with drag-and-drop simplicity.',
        target: '[href=\"/practice-planner\"]',
        placement: 'right',
        showNext: true,
        showPrevious: true
      },
      {
        id: 'templates',
        title: 'Practice Templates',
        content: 'Save time with pre-built practice templates designed for different age groups.',
        target: '.template-button',
        placement: 'bottom',
        showNext: true,
        showPrevious: true
      },
      {
        id: 'print',
        title: 'Print Your Plans',
        content: 'Take your practice plans to the field with our print-friendly format.',
        target: '.print-button',
        placement: 'bottom',
        showNext: true,
        showPrevious: true
      },
      {
        id: 'complete',
        title: "You're All Set!",
        content: "That's the basics! Explore the Skills Academy for player homework and the drill library for more activities.",
        target: '.sidebar-logo',
        placement: 'right',
        showNext: false,
        showPrevious: true
      }
    ]
  },
  {
    id: 'player-welcome',
    name: 'Player Welcome Tour',
    role: 'player',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to POWLAX!',
        content: "Ready to improve your lacrosse skills? Let's show you how to use the platform to get better.",
        target: '.sidebar-logo',
        placement: 'right',
        showNext: true,
        showPrevious: false
      },
      {
        id: 'skills-academy',
        title: 'Skills Academy',
        content: 'This is your home base for skill development. Find workouts, drills, and track your progress.',
        target: '[href=\"/academy\"]',
        placement: 'right',
        showNext: true,
        showPrevious: true
      },
      {
        id: 'workouts',
        title: 'Daily Workouts',
        content: 'Get personalized workouts you can do at home to improve your stick skills and fitness.',
        target: '.workout-section',
        placement: 'top',
        showNext: true,
        showPrevious: true
      },
      {
        id: 'progress',
        title: 'Track Your Progress',
        content: 'Earn points and badges as you complete workouts and improve your skills.',
        target: '.progress-section',
        placement: 'top',
        showNext: false,
        showPrevious: true
      }
    ]
  },
  {
    id: 'parent-welcome',
    name: 'Parent Welcome Tour',
    role: 'parent',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome Parents!',
        content: 'Learn how to support your child\'s lacrosse development with POWLAX.',
        target: '.sidebar-logo',
        placement: 'right',
        showNext: true,
        showPrevious: false
      },
      {
        id: 'player-progress',
        title: 'Monitor Progress',
        content: 'Keep track of your child\'s skill development and practice completion.',
        target: '.progress-dashboard',
        placement: 'top',
        showNext: true,
        showPrevious: true
      },
      {
        id: 'home-practice',
        title: 'Support Home Practice',
        content: 'Help your child with structured activities they can do at home.',
        target: '.home-practice-section',
        placement: 'top',
        showNext: false,
        showPrevious: true
      }
    ]
  }
]

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentTour, setCurrentTour] = useState<OnboardingTour | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedTours, setCompletedTours] = useState<string[]>([])

  useEffect(() => {
    // Load completed tours from localStorage
    const stored = localStorage.getItem('powlax-completed-tours')
    if (stored) {
      setCompletedTours(JSON.parse(stored))
    }
  }, [])

  const startTour = (tourId: string) => {
    const tour = tours.find(t => t.id === tourId)
    if (tour && !completedTours.includes(tourId)) {
      setCurrentTour(tour)
      setCurrentStepIndex(0)
    }
  }

  const nextStep = () => {
    if (currentTour && currentStepIndex < currentTour.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const skipTour = () => {
    if (currentTour) {
      const newCompleted = [...completedTours, currentTour.id]
      setCompletedTours(newCompleted)
      localStorage.setItem('powlax-completed-tours', JSON.stringify(newCompleted))
    }
    setCurrentTour(null)
    setCurrentStepIndex(0)
  }

  const completeTour = () => {
    if (currentTour) {
      const newCompleted = [...completedTours, currentTour.id]
      setCompletedTours(newCompleted)
      localStorage.setItem('powlax-completed-tours', JSON.stringify(newCompleted))
    }
    setCurrentTour(null)
    setCurrentStepIndex(0)
  }

  const hasCompletedTour = (tourId: string) => {
    return completedTours.includes(tourId)
  }

  return (
    <OnboardingContext.Provider
      value={{
        currentTour,
        currentStepIndex,
        isOnboarding: currentTour !== null,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        completeTour,
        hasCompletedTour
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}