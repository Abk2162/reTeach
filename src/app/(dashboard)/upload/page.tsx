'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FileDrop from '@/components/FileDrop'
import { parseTopics } from '@/lib/api'
import { useStore } from '@/lib/store'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function UploadPage() {
  const router = useRouter()
  const [syllabusText, setSyllabusText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setTopics = useStore((state) => state.setTopics)

  const handleFileText = (text: string) => {
    setSyllabusText(text)
    setError(null)
  }

  const handleExtract = async () => {
    if (!syllabusText.trim()) {
      setError('Please provide syllabus text or upload a file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const topics = await parseTopics(syllabusText)
      setTopics(topics)
      router.push('/review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract topics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400
              hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Upload Syllabus
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Paste your course syllabus or upload a PDF/TXT file to extract topics.
          </p>
        </div>

        <div className="space-y-6">
          {/* File Drop */}
          <div className="card bg-white dark:bg-gray-900 p-6">
            <FileDrop onText={handleFileText} />
          </div>

          {/* Text Area */}
          <div className="card bg-white dark:bg-gray-900 p-6">
            <label
              htmlFor="syllabus-text"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Or paste syllabus text
            </label>
            <textarea
              id="syllabus-text"
              rows={12}
              value={syllabusText}
              onChange={(e) => {
                setSyllabusText(e.target.value)
                setError(null)
              }}
              placeholder="Paste your course syllabus here...

Example:
Week 1-2: Introduction to Programming Concepts
Week 3-4: Data Structures and Algorithms
Week 5-6: Object-Oriented Programming
..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                font-mono text-sm resize-y"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Extract Button */}
          <button
            onClick={handleExtract}
            disabled={loading || !syllabusText.trim()}
            className="w-full px-6 py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300
              text-white font-semibold rounded-lg
              transition-all duration-200 shadow-lg hover:shadow-xl
              disabled:cursor-not-allowed disabled:shadow-none
              flex items-center justify-center gap-3"
            aria-label="Extract topics from syllabus"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Extracting Topics...
              </>
            ) : (
              'Extract Topics'
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
