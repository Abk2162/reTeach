'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, Edit, Trash2, Calendar, Users, Target, AlertTriangle, BookOpen, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { DiagnosticRow, TopicStat } from '@/lib/schema'

interface DiagSidePanelProps {
  open: boolean
  diag: DiagnosticRow | null
  miniStats: TopicStat[]
  loadingTopics?: boolean
  onClose: () => void
  onViewResults: () => void
  onEdit: () => void
  onDelete: () => void
  deletingId?: string | null
}

export default function DiagSidePanel({
  open,
  diag,
  miniStats,
  loadingTopics = false,
  onClose,
  onViewResults,
  onEdit,
  onDelete,
  deletingId
}: DiagSidePanelProps) {
  if (!diag) return null

  const getColor = (pct: number) => {
    if (pct >= 80) return '#10b981' // green
    if (pct >= 60) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  // Close on Escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto focus:outline-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200/70 dark:border-gray-700/60 px-6 py-5 z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h2 id="panel-title" className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {diag.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 px-2 py-0.5 bg-gray-50 dark:bg-gray-800">
                      <BookOpen className="w-3 h-3" />
                      {diag.course}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(diag.createdAt).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {diag.responses} {diag.responses === 1 ? 'response' : 'responses'}
                </span>
              </div>

              {/* Average Score */}
              {typeof diag.avgScore === 'number' && diag.responses > 0 && (
                <div className="flex items-center justify-between py-3 border-y border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average Score
                  </p>
                  <p className={`text-3xl font-bold ${
                    diag.avgScore >= 80
                      ? 'text-green-600 dark:text-green-400'
                      : diag.avgScore >= 60
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.round(diag.avgScore)}%
                  </p>
                </div>
              )}

              {/* Weak Topics */}
              {diag.weakTopics.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                    Topics Needing Focus
                  </h3>
                  <ul className="space-y-2">
                    {diag.weakTopics.map((topic, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mini Chart */}
              {loadingTopics && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading topic performance...
                </div>
              )}

              {!loadingTopics && miniStats.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                    Performance Overview
                  </h3>
                  <div className="rounded-xl border border-gray-200/70 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-5 shadow-sm hover:shadow-md transition-shadow">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={miniStats} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                        <XAxis
                          dataKey="topic"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{ fill: '#9ca3af', fontSize: 10 }}
                          tickLine={false}
                          axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fill: '#9ca3af', fontSize: 10 }}
                          axisLine={{ stroke: '#e5e7eb' }}
                          tickLine={false}
                          label={{ value: 'Avg Score %', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
                        />
                        <Tooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px',
                            boxShadow: '0 8px 20px rgba(15,23,42,0.08)'
                          }}
                          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
                          labelFormatter={(label: string) => label}
                        />
                        <Bar dataKey="correctPct" barSize={24}>
                          {miniStats.map((entry, index) => {
                            const fill = getColor(entry.correctPct)
                            return <Cell key={`cell-${index}`} fill={fill} />
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {!loadingTopics && miniStats.length === 0 && diag.responses > 0 && (
                <div className="rounded-xl border border-gray-200/70 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                  Topic-level stats will appear once responses are processed.
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                {diag.responses > 0 && (
                  <button
                    onClick={onViewResults}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold shadow-sm hover:shadow-md hover:from-indigo-500 hover:to-indigo-500 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Results
                  </button>
                )}
                <button
                  onClick={onEdit}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium shadow-sm hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Edit Diagnostic
                </button>
                <button
                  onClick={onDelete}
                  disabled={!!deletingId && diag.slug === deletingId}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-rose-600 dark:text-rose-300 font-medium shadow-sm hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all disabled:cursor-not-allowed"
                >
                  {deletingId && diag.slug === deletingId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete Diagnostic
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
