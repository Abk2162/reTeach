'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye } from 'lucide-react'
import type { DiagnosticRow } from '@/lib/schema'

interface DiagnosticsTableSimplifiedProps {
  rows: DiagnosticRow[]
  onView: (id: string) => void
  onRowClick: (row: DiagnosticRow) => void
}

export default function DiagnosticsTableSimplified({
  rows,
  onView,
  onRowClick
}: DiagnosticsTableSimplifiedProps) {
  const [search, setSearch] = useState('')

  // Filter active diagnostics only
  const filteredRows = useMemo(() => {
    const active = rows.filter(r => r.status === 'active' || r.status === 'published')

    if (search) {
      const searchLower = search.toLowerCase()
      return active.filter(r =>
        r.name.toLowerCase().includes(searchLower) ||
        r.course.toLowerCase().includes(searchLower)
      )
    }

    return active
  }, [rows, search])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
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
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left py-4 px-6 font-medium text-sm text-gray-600 dark:text-gray-400">
                Diagnostic Name
              </th>
              <th className="text-center py-4 px-6 font-medium text-sm text-gray-600 dark:text-gray-400">
                Completion
              </th>
              <th className="text-left py-4 px-6 font-medium text-sm text-gray-600 dark:text-gray-400">
                Weak Topic
              </th>
              <th className="text-right py-4 px-6 font-medium text-sm text-gray-600 dark:text-gray-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onRowClick(row)}
                className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
              >
                <td className="py-4 px-6">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {row.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="inline-flex flex-col items-center">
                    <p className={`text-lg font-semibold ${
                      row.completionPct >= 80
                        ? 'text-green-600 dark:text-green-400'
                        : row.completionPct >= 60
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {row.completionPct}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {row.responses} students
                    </p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  {row.weakTopics.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        {row.weakTopics[0]}
                      </span>
                      {row.weakTopics.length > 1 && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          +{row.weakTopics.length - 1}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-600">
                      No data
                    </span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end">
                    {row.responses > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onView(row.id)
                        }}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
            transition={{ delay: index * 0.05 }}
            onClick={() => onRowClick(row)}
            className="p-5 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {row.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(row.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className={`text-xl font-semibold ${
                  row.completionPct >= 80
                    ? 'text-green-600 dark:text-green-400'
                    : row.completionPct >= 60
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {row.completionPct}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {row.responses} students
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {row.weakTopics.length > 0 ? (
                  <>
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {row.weakTopics[0]}
                    </span>
                    {row.weakTopics.length > 1 && (
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        +{row.weakTopics.length - 1}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-600">
                    No data
                  </span>
                )}
              </div>
              {row.responses > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onView(row.id)
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  aria-label={`View results for ${row.name}`}
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRows.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {search ? 'No diagnostics found matching your search' : 'No active diagnostics'}
          </p>
        </div>
      )}
    </div>
  )
}
