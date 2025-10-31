'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import FileDrop from '@/components/FileDrop'
import { parseTopics } from '@/lib/api'
import { useStore } from '@/lib/store'
import { Loader2, ArrowLeft, ArrowRight, Eye, X, ChevronLeft, ChevronRight, FileText } from 'lucide-react'

interface UploadStepProps {
  onNext: () => void
  onBack: () => void
}

export default function UploadStep({ onNext, onBack }: UploadStepProps) {
  const [syllabusText, setSyllabusText] = useState('')
  const [extractedText, setExtractedText] = useState('')
  const [pdfPages, setPdfPages] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [hasUploadedFile, setHasUploadedFile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setTopics = useStore((state) => state.setTopics)

  const handleFileText = (text: string, pages?: string[]) => {
    setExtractedText(text)
    setHasUploadedFile(true)
    if (pages && pages.length > 0) {
      setPdfPages(pages)
    } else {
      // If no pages provided, create a single page
      setPdfPages([text])
    }
    setCurrentPage(0)
    setShowPreview(true)
    setError(null)
  }

  const confirmExtractedText = () => {
    setShowPreview(false)
  }

  const cancelPreview = () => {
    setExtractedText('')
    setPdfPages([])
    setCurrentPage(0)
    setShowPreview(false)
    setHasUploadedFile(false)
  }

  const nextPage = () => {
    if (currentPage < pdfPages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleExtract = async () => {
    const textToUse = extractedText || syllabusText

    if (!textToUse.trim()) {
      setError('Please provide syllabus text or upload a file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const topics = await parseTopics(textToUse)
      setTopics(topics)
      onNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract topics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* PDF Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelPreview}
              className="absolute inset-0"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Page {currentPage + 1} of {pdfPages.length}
                  </span>
                </div>
                <button
                  onClick={cancelPreview}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  aria-label="Close preview"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* PDF Page Display */}
              <div className="flex-1 overflow-hidden bg-gray-200 p-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-3xl h-full bg-white shadow-2xl overflow-hidden flex flex-col"
                    style={{ aspectRatio: '8.5/11' }}
                  >
                    {/* Page content */}
                    <div className="flex-1 overflow-y-auto p-16 bg-white">
                      <pre className="whitespace-pre-wrap text-gray-900 text-base leading-relaxed font-sans m-0">
                        {pdfPages[currentPage] || 'No content'}
                      </pre>
                    </div>

                    {/* Page number at bottom */}
                    <div className="py-3 text-center border-t border-gray-200 bg-white">
                      <span className="text-xs text-gray-400">— {currentPage + 1} —</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation & Actions */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="p-2 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Previous</span>
                  </button>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === pdfPages.length - 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1"
                    aria-label="Next page"
                  >
                    <span className="text-sm font-medium">Next</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={cancelPreview}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmExtractedText}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-green-600/30"
                  >
                    Use This Document
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl w-full"
        >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Upload Your Syllabus
          </h2>
          <p className="text-lg text-gray-600">
            Paste your course content or upload a file. We'll extract the topics automatically.
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6">
          {/* File Drop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <FileDrop onText={handleFileText} />
          </motion.div>

          {/* Text Area - Only show if no file uploaded */}
          {!hasUploadedFile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <label
                htmlFor="syllabus-text"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Or paste syllabus text
              </label>
              <textarea
                id="syllabus-text"
                rows={10}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl
                  focus:ring-2 focus:ring-green-500 focus:border-transparent
                  bg-white text-gray-900
                  placeholder-gray-400
                  font-mono text-sm resize-y"
              />
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>

            <motion.button
              onClick={handleExtract}
              disabled={loading || (!syllabusText.trim() && !extractedText.trim())}
              whileHover={(syllabusText.trim() || extractedText.trim()) ? { scale: 1.02 } : {}}
              whileTap={(syllabusText.trim() || extractedText.trim()) ? { scale: 0.98 } : {}}
              className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300
                text-white font-semibold rounded-lg
                transition-all duration-200 shadow-lg hover:shadow-xl
                disabled:cursor-not-allowed disabled:shadow-none
                flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Extracting Topics...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
    </>
  )
}
