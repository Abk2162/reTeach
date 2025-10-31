'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, FileText, Check, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { API_BASE_URL } from '@/lib/api'

interface Topic {
  id: string
  name: string
  weight: number
  chapter?: string
  page_range?: string
  keywords?: string[]
  selected: boolean
}

function ReviewTopicsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const textbookTitle = searchParams?.get('title') || 'Uploaded Textbook'
  const assessmentType = searchParams?.get('type') as 'survey' | 'quiz' || 'survey'
  const textbookId = searchParams?.get('textbookId') // Will get from upload

  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch auto-populated topics from backend
    fetchTopics()
  }, [textbookId])

  const fetchTopics = async () => {
    try {
      setLoading(true)

      // Fetch topics from backend (they were extracted during upload)
      if (!textbookId) {
        setError('No textbook ID provided')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/textbooks/${textbookId}/topics`)

      if (!response.ok) {
        throw new Error('Failed to fetch topics')
      }

      const data = await response.json()

      // Transform backend topics to frontend format
      const transformedTopics = data.topics.map((t: any) => ({
        id: t.id,
        name: t.name,
        weight: t.weight,
        chapter: t.metadata?.chapter,
        page_range: t.metadata?.page_range,
        keywords: t.metadata?.keywords || [],
        selected: true // All topics selected by default
      }))

      setTopics(transformedTopics)
      setLoading(false)
    } catch (err) {
      setError('Failed to load topics from textbook')
      setLoading(false)
    }
  }

  const toggleTopic = (topicId: string) => {
    setTopics(prev => prev.map(t =>
      t.id === topicId ? { ...t, selected: !t.selected } : t
    ))
  }

  const toggleAll = () => {
    const allSelected = topics.every(t => t.selected)
    setTopics(prev => prev.map(t => ({ ...t, selected: !allSelected })))
  }

  const handleContinue = () => {
    const selectedTopics = topics.filter(t => t.selected)

    if (selectedTopics.length === 0) {
      setError('Please select at least one topic')
      return
    }

    // Route to appropriate generation page based on assessment type
    const topicIds = selectedTopics.map(t => t.id).join(',')
    if (assessmentType === 'survey') {
      router.push(`/generate-survey?topics=${topicIds}&title=${encodeURIComponent(textbookTitle)}`)
    } else {
      router.push(`/generate-quiz?topics=${topicIds}&title=${encodeURIComponent(textbookTitle)}`)
    }
  }

  const selectedCount = topics.filter(t => t.selected).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10 md:px-8">
        {/* Header */}
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Review Topics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Topics auto-populated from <span className="font-semibold">{textbookTitle}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {assessmentType === 'survey' ? 'Creating Diagnostic Survey' : 'Creating Formal Quiz'}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Analyzing textbook and extracting topics...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Topics List */}
        {!loading && !error && (
          <>
            {/* Selection Controls */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedCount} of {topics.length} topics selected
                </span>
              </div>
              <button
                onClick={toggleAll}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                {topics.every(t => t.selected) ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Topics Cards */}
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => toggleTopic(topic.id)}
                    className={`
                      w-full text-left group relative overflow-hidden rounded-xl border-2 transition-all duration-200
                      ${topic.selected
                        ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
                      }
                    `}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className={`
                          flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors
                          ${topic.selected
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'
                          }
                        `}>
                          {topic.selected && <Check className="w-4 h-4 text-white" />}
                        </div>

                        {/* Topic Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {topic.name}
                              </h3>
                              {topic.chapter && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {topic.chapter} • Pages {topic.page_range}
                                </p>
                              )}
                            </div>
                            <div className="flex-shrink-0 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Weight: {topic.weight.toFixed(1)}
                              </span>
                            </div>
                          </div>

                          {/* Keywords */}
                          {topic.keywords && topic.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {topic.keywords.map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md border border-gray-200 dark:border-gray-700"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Continue Button */}
            <div className="sticky bottom-6 pt-6">
              <button
                onClick={handleContinue}
                disabled={selectedCount === 0}
                className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {selectedCount === 0
                  ? 'Select topics to continue'
                  : `Continue with ${selectedCount} topic${selectedCount === 1 ? '' : 's'}`
                }
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}


export default function ReviewTopicsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewTopicsPageContent />
    </Suspense>
  )
}
