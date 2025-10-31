'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ClipboardList, CheckCircle } from 'lucide-react'
import { API_BASE_URL } from '@/lib/api'

interface FormInfo {
  form_id: string
  title: string
  total_questions: number
  status: string
}

interface Question {
  id: string
  topic: string
  stem: string
  options: string[]
  answerIndex: number
}

export default function FormPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [step, setStep] = useState<'info' | 'questions' | 'complete'>('info')
  const [formInfo, setFormInfo] = useState<FormInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Student info
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Session
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Questions
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  // Fetch form info on load
  useEffect(() => {
    if (!slug) return

    const fetchFormInfo = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/forms/${slug}`)

        if (!response.ok) {
          throw new Error('Form not found')
        }

        const data = await response.json()
        setFormInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load form')
      } finally {
        setLoading(false)
      }
    }

    fetchFormInfo()
  }, [slug])

  // Handle student info submission
  const handleStartForm = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      setError('Please enter your name and email')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/forms/${slug}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() })
      })

      if (!response.ok) {
        throw new Error('Failed to start form')
      }

      const data = await response.json()
      setSessionId(data.session_id)

      // Fetch questions
      await fetchQuestions()

      setStep('questions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start form')
    } finally {
      setSubmitting(false)
    }
  }

  // Fetch questions
  const fetchQuestions = async () => {
    setLoadingQuestions(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/forms/${slug}/questions`)

      if (!response.ok) {
        throw new Error('Failed to load questions')
      }

      const data = await response.json()
      setQuestions(data.questions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions')
    } finally {
      setLoadingQuestions(false)
    }
  }

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  // Submit answers
  const handleSubmit = async () => {
    if (!sessionId) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/forms/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          answers: Object.entries(answers).map(([question_id, selected_index]) => ({
            question_id,
            selected_index
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit answers')
      }

      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answers')
    } finally {
      setSubmitting(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const answeredCount = Object.keys(answers).length

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading form...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !formInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
              Form Not Found
            </h2>
            <p className="text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
                  <ClipboardList className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  {formInfo?.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {formInfo?.total_questions} questions • ~{Math.ceil((formInfo?.total_questions || 0) * 1.5)} minutes
                </p>
              </div>

              {/* Student Info Form */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Enter Your Information
                </h2>

                <form onSubmit={handleStartForm} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="jane.smith@school.edu"
                      className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !name.trim() || !email.trim()}
                    className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      'Start Diagnostic →'
                    )}
                  </button>
                </form>

                <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Your information will be used to track your progress and provide personalized feedback.
                </p>
              </div>
            </motion.div>
          )}

          {step === 'questions' && sessionId && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {loadingQuestions ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>
                  </div>
                </div>
              ) : currentQuestion ? (
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {answeredCount}/{questions.length} answered
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Card */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                    <div className="mb-6">
                      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">
                        {currentQuestion.topic}
                      </div>
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                        {currentQuestion.stem}
                      </h2>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mb-8">
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = answers[currentQuestion.id] === index
                        const optionLabel = String.fromCharCode(65 + index) // A, B, C, D

                        return (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                              }`}>
                                {optionLabel}
                              </div>
                              <div className="flex-1 pt-1">
                                <p className="text-gray-900 dark:text-white">{option}</p>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                      >
                        ← Previous
                      </button>

                      {isLastQuestion ? (
                        <button
                          onClick={handleSubmit}
                          disabled={submitting || answeredCount < questions.length}
                          className="px-8 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit Answers
                              <CheckCircle className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handleNext}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all"
                        >
                          Next →
                        </button>
                      )}
                    </div>

                    {answeredCount < questions.length && isLastQuestion && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 text-center mt-4">
                        Please answer all questions before submitting
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    No questions available
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Thank You!
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                  Your responses have been submitted successfully.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Check your email (including spam folder) for personalized study resources based on your results.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
