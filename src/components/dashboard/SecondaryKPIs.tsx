'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Target } from 'lucide-react'

interface SecondaryKPIsProps {
  needsAttentionCount: number
  topWeakTopic: string | null
}

export default function SecondaryKPIs({ needsAttentionCount, topWeakTopic }: SecondaryKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Diagnostics Needing Attention */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Needs Attention
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {needsAttentionCount}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Top Weak Topic */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Top Weak Topic
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {topWeakTopic || 'No data'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
