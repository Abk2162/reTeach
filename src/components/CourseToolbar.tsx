'use client'

import { ChevronDown } from 'lucide-react'

interface CourseToolbarProps {
  courses: string[]
  selectedCourse: string
  onSelectCourse: (course: string) => void
}

export default function CourseToolbar({ courses, selectedCourse, onSelectCourse }: CourseToolbarProps) {
  return (
    <div className="sticky top-16 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-6 md:px-12 h-14 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <label htmlFor="course-select" className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Course:
          </label>
          <div className="relative">
            <select
              id="course-select"
              value={selectedCourse}
              onChange={(e) => onSelectCourse(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              aria-label="Select course"
            >
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
