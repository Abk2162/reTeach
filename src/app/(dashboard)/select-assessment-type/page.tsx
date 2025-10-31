'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ClipboardCheck, FileText, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

function SelectAssessmentTypePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const textbookTitle = searchParams?.get('title') || 'Uploaded Textbook'
  const textbookId = searchParams?.get('textbookId')

  const assessmentTypes = [
    {
      id: 'survey',
      title: 'Diagnostic Survey',
      description: 'Informal yes/no questions to assess student knowledge gaps',
      example: '"Can you solve quadratic equations?" (Yes/No)',
      icon: ClipboardCheck,
      color: 'indigo',
      features: [
        'Quick to complete (5-10 minutes)',
        'Yes/No format',
        'Identifies knowledge gaps',
        'Creates personalized study plans'
      ]
    },
    {
      id: 'quiz',
      title: 'Formal Quiz',
      description: 'Multiple-choice questions with detailed answer explanations',
      example: '"What is the solution to x² + 5x + 6 = 0?" (Multiple Choice)',
      icon: FileText,
      color: 'emerald',
      features: [
        'Comprehensive assessment',
        'Multiple choice questions',
        'Answer explanations',
        'Exportable to PDF or site'
      ]
    }
  ]

  const handleSelectType = (type: 'survey' | 'quiz') => {
    // Navigate to topics page with assessment type and textbook ID
    router.push(`/review-topics?type=${type}&title=${encodeURIComponent(textbookTitle)}&textbookId=${textbookId}`)
  }

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
              Choose Assessment Type
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              For <span className="font-semibold">{textbookTitle}</span>
            </p>
          </div>
        </div>

        {/* Assessment Type Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {assessmentTypes.map((type, index) => {
            const Icon = type.icon
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleSelectType(type.id as 'survey' | 'quiz')}
                  className="w-full text-left group"
                >
                  <div className={`
                    relative overflow-hidden rounded-2xl border-2 transition-all duration-300
                    ${type.color === 'indigo'
                      ? 'border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-indigo-900/50'
                      : 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-xl hover:shadow-emerald-100 dark:hover:shadow-emerald-900/50'
                    }
                    bg-white dark:bg-gray-900
                  `}>
                    {/* Header */}
                    <div className={`
                      px-6 py-5 border-b
                      ${type.color === 'indigo'
                        ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900'
                        : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900'
                      }
                    `}>
                      <div className="flex items-start gap-4">
                        <div className={`
                          flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                          ${type.color === 'indigo'
                            ? 'bg-indigo-600'
                            : 'bg-emerald-600'
                          }
                        `}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {type.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      {/* Example */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                          Example Question
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                          {type.example}
                        </p>
                      </div>

                      {/* Features */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                          Features
                        </p>
                        <ul className="space-y-2">
                          {type.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <div className={`
                                flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5
                                ${type.color === 'indigo' ? 'bg-indigo-600' : 'bg-emerald-600'}
                              `} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Select Button */}
                      <div className="pt-2">
                        <div className={`
                          w-full py-3 px-4 rounded-xl font-semibold text-center transition-colors
                          ${type.color === 'indigo'
                            ? 'bg-indigo-600 group-hover:bg-indigo-500 text-white'
                            : 'bg-emerald-600 group-hover:bg-emerald-500 text-white'
                          }
                        `}>
                          Select {type.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Not sure which to choose?
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Use a survey</strong> for quick diagnostic checks to identify what students need to study.
            <strong> Use a quiz</strong> for formal assessments with detailed grading and feedback.
          </p>
        </div>
      </main>
    </div>
  )
}


export default function SelectAssessmentTypePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SelectAssessmentTypePageContent />
    </Suspense>
  )
}
