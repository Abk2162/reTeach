'use client'

import { motion } from 'framer-motion'
import { BookOpen, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface CourseSelectorProps {
  courses: string[]
  selectedCourse: string
  onSelectCourse: (course: string) => void
}

export default function CourseSelector({ courses, selectedCourse, onSelectCourse }: CourseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
      >
        <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <div className="text-left">
          <p className="text-xs text-gray-500 dark:text-gray-500">Course</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {selectedCourse}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 py-2"
          >
            {courses.map((course) => (
              <button
                key={course}
                onClick={() => {
                  onSelectCourse(course)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                  course === selectedCourse
                    ? 'bg-gray-50 dark:bg-gray-750 font-semibold text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {course}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  )
}
