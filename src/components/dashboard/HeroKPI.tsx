'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface HeroKPIProps {
  readinessPct: number
  courseName: string
  onCreate: () => void
}

export default function HeroKPI({ readinessPct, courseName, onCreate }: HeroKPIProps) {
  const getStatusColor = (pct: number) => {
    if (pct >= 80) return 'text-green-600 dark:text-green-400'
    if (pct >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getBgGradient = (pct: number) => {
    if (pct >= 80) return 'bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-gray-800'
    if (pct >= 60) return 'bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-800'
    return 'bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-gray-800'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 ${getBgGradient(readinessPct)}`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          Class Readiness for
        </p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {courseName}
        </h2>
      </div>

      {/* Metric */}
      <div className="text-center mb-10">
        <p className={`text-7xl font-bold ${getStatusColor(readinessPct)} mb-2`}>
          {readinessPct}%
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Average completion rate across active diagnostics
        </p>
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <Link href="/upload">
          <motion.button
            onClick={onCreate}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create New Diagnostic
          </motion.button>
        </Link>
      </div>
    </motion.div>
  )
}
