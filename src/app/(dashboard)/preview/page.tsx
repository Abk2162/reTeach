'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import QuestionTable from '@/components/QuestionTable'
import { createForm } from '@/lib/api'
import { useStore } from '@/lib/store'
import { Loader2, ArrowLeft, User, ClipboardList } from 'lucide-react'

export default function PreviewPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const questions = useStore((state) => state.questions)
  const setQuestions = useStore((state) => state.setQuestions)
  const setPublishInfo = useStore((state) => state.setPublishInfo)
  const completeOnboarding = useStore((state) => state.completeOnboarding)
  const hasCompletedOnboarding = useStore((state) => state.onboardingCompleted)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('Diagnostic Assessment')
  const [previewTab, setPreviewTab] = useState<'info' | 'questions'>('info')

  useEffect(() => {
    // Redirect if no questions, but not while publishing
    if (questions.length === 0 && !loading) {
      router.push('/upload')
    }
  }, [questions, router, loading])

  const handlePublish = async () => {
    setLoading(true)
    setError(null)

    try {
      const { formUrl, slug, formId } = await createForm(formTitle, questions)
      setPublishInfo({ formUrl, formSlug: slug, formId })

      // If user hasn't completed onboarding, mark it as complete now
      if (!hasCompletedOnboarding && session?.user?.email) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers/${session.user.email}/complete-onboarding`, {
            method: 'POST'
          })
          completeOnboarding()
        } catch (error) {
          console.error('Failed to mark onboarding complete:', error)
          // Don't block the publish flow if this fails
        }
      }

      const query = new URLSearchParams({
        formUrl,
        slug,
        formId: formId ?? slug
      })
      router.push(`/publish?${query.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form')
    } finally {
      setLoading(false)
    }
  }

  if (questions.length === 0) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/review')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400
              hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            aria-label="Back to review"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Review
          </button>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Preview Questions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Edit questions, options, and correct answers. Click the checkmark to set the correct answer.
          </p>
        </div>

        <div className="space-y-6">
          {/* Form Title */}
          <div className="card bg-white dark:bg-gray-900 p-6">
            <label
              htmlFor="form-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Form Title
            </label>
            <input
              type="text"
              id="form-title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="e.g., Week 1 Diagnostic Assessment"
            />
          </div>

          {/* Student Preview Tabs */}
          <div className="card bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Student View Preview
            </h2>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => setPreviewTab('info')}
                className={`px-4 py-2 font-medium text-sm transition-all border-b-2 ${
                  previewTab === 'info'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Page 1: Student Info
                </div>
              </button>
              <button
                onClick={() => setPreviewTab('questions')}
                className={`px-4 py-2 font-medium text-sm transition-all border-b-2 ${
                  previewTab === 'questions'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Page 2: Questions
                </div>
              </button>
            </div>

            {/* Preview Content */}
            {previewTab === 'info' ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 bg-gray-50 dark:bg-gray-800/50">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-3">
                      <ClipboardList className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {formTitle}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {questions.length} questions • ~{Math.ceil(questions.length * 1.5)} minutes
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-400">
                        Jane Smith
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-400">
                        jane.smith@school.edu
                      </div>
                    </div>
                    <button
                      disabled
                      className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-xl cursor-not-allowed"
                    >
                      Start Diagnostic →
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Preview: Students enter their information before seeing questions
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 bg-gray-50 dark:bg-gray-800/50">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Question 1 of {questions.length}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        0/{questions.length} answered
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 w-[5%]" />
                    </div>
                  </div>

                  {questions.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">
                          {questions[0].topic}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {questions[0].stem}
                        </h3>
                      </div>

                      <div className="space-y-2 mb-6">
                        {questions[0].options.slice(0, 4).map((option, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-not-allowed"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <p className="flex-1 text-gray-700 dark:text-gray-300 text-sm">
                                {option}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between">
                        <button
                          disabled
                          className="px-4 py-2 border-2 border-gray-300 dark:border-gray-700 text-gray-400 font-semibold rounded-lg cursor-not-allowed"
                        >
                          ← Previous
                        </button>
                        <button
                          disabled
                          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg cursor-not-allowed"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Preview: Students answer questions one at a time
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Questions Table for Editing */}
          <div className="card bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Questions
            </h2>
            <QuestionTable questions={questions} onChange={setQuestions} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            disabled={loading || !formTitle.trim() || questions.length === 0}
            className="w-full px-6 py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300
              text-white font-semibold rounded-lg
              transition-all duration-200 shadow-lg hover:shadow-xl
              disabled:cursor-not-allowed disabled:shadow-none
              flex items-center justify-center gap-3"
            aria-label="Publish form"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating your reTeach form...
              </>
            ) : (
              'Publish Form'
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
