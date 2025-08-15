'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, XCircle, Clock, Trophy, Star, 
  ArrowLeft, ArrowRight, Play, RotateCcw, Home
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { WorkoutWithQuestions, WorkoutProgress } from '@/types/skills-academy'

interface WorkoutRunnerProps {
  workout: WorkoutWithQuestions
}

export default function WorkoutRunner({ workout }: WorkoutRunnerProps) {
  const router = useRouter()
  const [progress, setProgress] = useState<WorkoutProgress>({
    currentQuestionIndex: 0,
    totalQuestions: workout.questions.length,
    score: 0,
    answers: {},
    startTime: new Date()
  })
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQuestion = workout.questions[progress.currentQuestionIndex]
  const isLastQuestion = progress.currentQuestionIndex === progress.totalQuestions - 1
  const progressPercentage = ((progress.currentQuestionIndex + 1) / progress.totalQuestions) * 100

  // Auto-start workout
  useEffect(() => {
    if (workout.auto_start && !isCompleted) {
      // Workout starts automatically
    }
  }, [workout.auto_start, isCompleted])

  const handleAnswerSelect = useCallback((answerId: number) => {
    if (showFeedback) return // Don't allow changes after submission
    
    setSelectedAnswers(prev => {
      if (prev.includes(answerId)) {
        return prev.filter(id => id !== answerId)
      } else {
        // For single-answer questions, replace the selection
        // For multi-answer questions, add to selection
        const isMultiSelect = currentQuestion.answers.filter(a => a.is_correct).length > 1
        return isMultiSelect ? [...prev, answerId] : [answerId]
      }
    })
  }, [showFeedback, currentQuestion])

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswers.length === 0) return

    const correctAnswerIds = currentQuestion.answers
      .filter(answer => answer.is_correct)
      .map(answer => answer.id)

    const isCorrect = selectedAnswers.length === correctAnswerIds.length &&
      selectedAnswers.every(id => correctAnswerIds.includes(id))

    const points = isCorrect ? (currentQuestion.points || 0) : 0

    setProgress(prev => ({
      ...prev,
      score: prev.score + points,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: selectedAnswers
      }
    }))

    setShowFeedback(true)
  }, [selectedAnswers, currentQuestion])

  const handleNextQuestion = useCallback(() => {
    if (isLastQuestion) {
      setProgress(prev => ({
        ...prev,
        completedAt: new Date()
      }))
      setIsCompleted(true)
    } else {
      setProgress(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }))
      setSelectedAnswers([])
      setShowFeedback(false)
    }
  }, [isLastQuestion])

  const handlePreviousQuestion = useCallback(() => {
    if (progress.currentQuestionIndex > 0) {
      setProgress(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }))
      
      // Restore previous answers if any
      const previousQuestion = workout.questions[progress.currentQuestionIndex - 1]
      const previousAnswers = progress.answers[previousQuestion.id] || []
      setSelectedAnswers(previousAnswers)
      setShowFeedback(previousAnswers.length > 0)
    }
  }, [progress.currentQuestionIndex, progress.answers, workout.questions])

  const handleRestart = useCallback(() => {
    setProgress({
      currentQuestionIndex: 0,
      totalQuestions: workout.questions.length,
      score: 0,
      answers: {},
      startTime: new Date()
    })
    setSelectedAnswers([])
    setShowFeedback(false)
    setIsCompleted(false)
  }, [workout.questions.length])

  if (isCompleted) {
    const completionTime = progress.completedAt && progress.startTime
      ? Math.round((progress.completedAt.getTime() - progress.startTime.getTime()) / 1000)
      : 0

    const scorePercentage = progress.totalQuestions > 0 
      ? Math.round((progress.score / (progress.totalQuestions * (currentQuestion?.points || 10))) * 100)
      : 0

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Completion Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Workout Complete!</h1>
            <p className="text-muted-foreground">Great job finishing {workout.name}</p>
          </div>
        </div>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Your Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score */}
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">{scorePercentage}%</div>
              <div className="text-muted-foreground">
                {progress.score} points out of {progress.totalQuestions * (currentQuestion?.points || 10)}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{progress.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{Math.floor(completionTime / 60)}:{String(completionTime % 60).padStart(2, '0')}</div>
                <div className="text-sm text-muted-foreground">Time</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleRestart} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button asChild className="flex-1">
                <Link href="/skills-academy">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Academy
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert>
          <AlertDescription>
            This workout doesn&apos;t have any questions configured yet.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workout.name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            {workout.workout_series && (
              <span>{workout.workout_series} {workout.series_number}</span>
            )}
            {workout.workout_size && (
              <Badge variant="outline">{workout.workout_size}</Badge>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/skills-academy">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Link>
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Question {progress.currentQuestionIndex + 1} of {progress.totalQuestions}</span>
              <span>Score: {progress.score}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentQuestion.title && (
              <>
                <Play className="w-5 h-5 text-primary" />
                {currentQuestion.title}
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Text */}
          {currentQuestion.question_text && (
            <div className="text-lg">{currentQuestion.question_text}</div>
          )}

          {/* Video if available */}
          {currentQuestion.drill?.video_url && (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <Play className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Video: {currentQuestion.drill.title}</p>
              </div>
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => {
              const isSelected = selectedAnswers.includes(answer.id)
              const isCorrect = answer.is_correct
              const showResult = showFeedback

              return (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(answer.id)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full p-4 text-left border rounded-lg transition-all",
                    "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary",
                    isSelected && !showResult && "border-primary bg-primary/10",
                    showResult && isCorrect && "border-green-500 bg-green-50",
                    showResult && !isCorrect && isSelected && "border-red-500 bg-red-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{answer.answer_text}</span>
                    {showResult && (
                      isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : isSelected ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : null
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Feedback Messages */}
          {showFeedback && (
            <Alert className={cn(
              selectedAnswers.some(id => 
                currentQuestion.answers.find(a => a.id === id)?.is_correct
              ) ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
            )}>
              <AlertDescription>
                {selectedAnswers.some(id => 
                  currentQuestion.answers.find(a => a.id === id)?.is_correct
                ) 
                  ? currentQuestion.correct_message || "Correct! Well done."
                  : currentQuestion.incorrect_message || "Not quite right. Try again!"
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={progress.currentQuestionIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {!showFeedback ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswers.length === 0}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {isLastQuestion ? "Finish Workout" : "Next Question"}
                  {!isLastQuestion && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}