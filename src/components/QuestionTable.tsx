'use client'

import { useState } from 'react'
import type { Question } from '@/lib/schema'
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react'

interface QuestionTableProps {
  questions: Question[]
  onChange: (questions: Question[]) => void
}

export default function QuestionTable({ questions, onChange }: QuestionTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleStemChange = (questionId: string, stem: string) => {
    const updated = questions.map(q =>
      q.id === questionId ? { ...q, stem } : q
    )
    onChange(updated)
  }

  const handleRemove = (questionId: string) => {
    const updated = questions.filter(q => q.id !== questionId)
    onChange(updated)
    if (expandedId === questionId) {
      setExpandedId(null)
    }
  }

  const toggleExpand = (questionId: string) => {
    setExpandedId(expandedId === questionId ? null : questionId)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Questions ({questions.length})
        </h3>
      </div>

      <div className="space-y-2">
        {questions.map((question, qIndex) => {
          const isExpanded = expandedId === question.id

          return (
            <div
              key={question.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
            >
              {/* Compact Question Row */}
              <div
                onClick={() => toggleExpand(question.id)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {/* Expand/Collapse Icon */}
                <button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {/* Question Number */}
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 min-w-[2rem]">
                  Q{qIndex + 1}
                </span>

                {/* Question Stem (truncated) */}
                <p className="flex-1 text-sm text-gray-900 dark:text-white truncate">
                  {question.stem}
                </p>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(question.id)
                  }}
                  className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300
                    hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors"
                  aria-label={`Delete question ${qIndex + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 space-y-4 border-t border-gray-100 dark:border-gray-800">
                  {/* Question Stem Editor */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Question Text
                    </label>
                    <textarea
                      value={question.stem}
                      onChange={(e) => handleStemChange(question.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                        text-sm resize-y"
                      aria-label={`Edit question ${qIndex + 1} text`}
                    />
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Topic:</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                        {question.topic}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Difficulty:</span>
                      <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                        {question.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Response Options */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Response Options:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {question.options.map((option, optIndex) => (
                        <span
                          key={optIndex}
                          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {questions.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No questions generated yet
        </div>
      )}
    </div>
  )
}
