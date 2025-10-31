'use client'

import { useState, useRef, useEffect } from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CourseSelectorCompactProps {
  courses: string[]
  selectedCourse: string
  onSelectCourse: (course: string) => void
}

export default function CourseSelectorCompact({ courses, selectedCourse, onSelectCourse }: CourseSelectorCompactProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (course: string) => {
    onSelectCourse(course)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Select course"
        aria-expanded={isOpen}
      >
        <BookOpen className="w-4 h-4" />
        <span className="font-medium">{selectedCourse}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <div className="py-2">
              {courses.map((course) => (
                <button
                  key={course}
                  onClick={() => handleSelect(course)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    course === selectedCourse
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                >
                  {course}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
