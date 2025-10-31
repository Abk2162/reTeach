'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, BookOpen } from 'lucide-react'
import { useStore } from '@/lib/store'

interface CourseNameStepProps {
  onNext: () => void
  onBack: () => void
}

export default function CourseNameStep({ onNext, onBack }: CourseNameStepProps) {
  const { courseName, setCourseName } = useStore()
  const [name, setName] = useState(courseName || '')

  const handleNext = () => {
    if (name.trim()) {
      setCourseName(name.trim())
      onNext()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 md:p-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
            What's your course called?
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            Give your course a name that you'll see on your dashboard
          </p>

          <div className="mb-8">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Algebra 1, AP Calculus, Introduction to Chemistry"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  handleNext()
                }
              }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
