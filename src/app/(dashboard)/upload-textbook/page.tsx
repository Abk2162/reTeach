'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Loader2, BookOpen, ArrowRight, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { API_BASE_URL } from '@/lib/api'

export default function UploadTextbookPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      validateAndSetFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      validateAndSetFile(files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    // Check if PDF
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size must be less than 50MB')
      return
    }

    setFile(file)
    setError(null)

    // Auto-fill title from filename
    if (!title) {
      const filename = file.name.replace('.pdf', '')
      setTitle(filename)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file')
      return
    }

    if (!title.trim()) {
      setError('Please enter a textbook title')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Upload to backend and get auto-extracted topics
      const response = await fetch(`${API_BASE_URL}/api/textbooks/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to upload textbook')
      }

      const data = await response.json()

      // Navigate to assessment type selection with textbook data
      router.push(`/select-assessment-type?textbookId=${data.textbook_id}&title=${encodeURIComponent(title)}`)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload textbook')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-10 md:px-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Upload Textbook
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload a PDF textbook to automatically extract topics and generate questions
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl transition-all ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
              : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900'
          }`}
        >
          <div className="p-12">
            {!file ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
                  <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Upload your textbook PDF
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Drag and drop or click to browse
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
                    <Upload className="w-5 h-5" />
                    Select PDF File
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  Maximum file size: 50MB
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Textbook Title */}
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Textbook Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Stewart Calculus 8th Edition"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
          >
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Upload Button */}
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={handleUpload}
              disabled={uploading || !title.trim()}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing textbook...
                </>
              ) : (
                <>
                  Continue to Topics
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
              We'll automatically extract topics and chapters from your textbook
            </p>
          </motion.div>
        )}
      </main>
    </div>
  )
}
