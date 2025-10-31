'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye, Trash2, Loader2, Copy, Check } from 'lucide-react'
import type { DiagnosticRow } from '@/lib/schema'

interface DiagnosticsTableProps {
  rows: DiagnosticRow[]
  onRowClick: (row: DiagnosticRow) => void
  onView: (id: string) => void
  onDelete?: (slug: string) => void
  deletingId?: string | null
}

export default function DiagnosticsTable({
  rows,
  onRowClick,
  onView,
  onDelete,
  deletingId
}: DiagnosticsTableProps) {
  const [search, setSearch] = useState('')
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  const filteredRows = useMemo(() => {
    if (!search) return rows
    const searchLower = search.toLowerCase()
    return rows.filter(r => r.name.toLowerCase().includes(searchLower))
  }, [rows, search])

  const getCompletionColor = (pct: number) => {
    if (pct > 80) return 'text-green-600 dark:text-green-400'
    if (pct >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const handleCopyShareLink = async (e: React.MouseEvent, slug: string) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/form/${slug}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedSlug(slug)
      setTimeout(() => setCopiedSlug(null), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
          Active Diagnostics
        </h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search diagnostics"
          />
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-auto" role="table">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                Name
              </th>
              <th className="text-center py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Score
              </th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                Weak Topic
              </th>
              <th className="text-right py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredRows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onRowClick(row)}
                className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
              >
                <td className="py-4 px-6">
                  <p className="text-sm md:text-base font-medium text-gray-900 dark:text-white">
                    {row.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="inline-flex flex-col items-center gap-1">
                    <p className={`text-lg font-semibold ${getCompletionColor(row.avgScore ?? 0)}`}>
                      {row.avgScore !== undefined ? `${Math.round(row.avgScore)}%` : '—'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {row.responses} students
                    </p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  {row.weakTopics.length > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        {row.weakTopics[0]}
                      </span>
                      {row.weakTopics.length > 1 && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          +{row.weakTopics.length - 1}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-600">No data</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => handleCopyShareLink(e, row.slug)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                      aria-label={`Copy share link for ${row.name}`}
                      title="Copy share link"
                    >
                      {copiedSlug === row.slug ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(row.slug)
                        }}
                        disabled={deletingId === row.slug}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:cursor-not-allowed"
                        aria-label={`Delete ${row.name}`}
                      >
                        {deletingId === row.slug ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {row.responses > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onView(row.id)
                        }}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`View results for ${row.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
        {filteredRows.map((row, index) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onRowClick(row)}
            className="p-5 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {row.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(row.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className={`text-xl font-semibold ${getCompletionColor(row.avgScore ?? 0)}`}>
                  {row.avgScore !== undefined ? `${Math.round(row.avgScore)}%` : '—'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {row.responses} students
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {row.weakTopics.length > 0 ? (
                  <>
                    <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {row.weakTopics[0]}
                    </span>
                    {row.weakTopics.length > 1 && (
                      <span className="text-xs text-gray-500">+{row.weakTopics.length - 1}</span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-gray-400">No data</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleCopyShareLink(e, row.slug)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  aria-label={`Copy share link for ${row.name}`}
                >
                  {copiedSlug === row.slug ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(row.slug)
                    }}
                    disabled={deletingId === row.slug}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors disabled:cursor-not-allowed"
                    aria-label={`Delete ${row.name}`}
                  >
                    {deletingId === row.slug ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
                {row.responses > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onView(row.id)
                    }}
                    className="p-2 text-gray-600 dark:text-gray-400 rounded-lg"
                    aria-label={`View ${row.name}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRows.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            {search ? 'No diagnostics found matching your search' : 'No active diagnostics'}
          </p>
        </div>
      )}
    </div>
  )
}
