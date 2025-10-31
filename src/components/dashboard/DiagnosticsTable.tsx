'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronDown, Eye, Copy, Archive, Calendar, Users, Target } from 'lucide-react'
import type { DiagnosticRow } from '@/lib/schema'

interface DiagnosticsTableProps {
  rows: DiagnosticRow[]
  onView: (id: string) => void
  onDuplicate: (id: string) => void
  onArchive: (id: string) => void
  onRowClick: (row: DiagnosticRow) => void
}

type SortField = 'name' | 'createdAt' | 'responses'
type SortDirection = 'asc' | 'desc'

export default function DiagnosticsTable({
  rows,
  onView,
  onDuplicate,
  onArchive,
  onRowClick
}: DiagnosticsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Extract unique courses
  const courses = useMemo(() => {
    const uniqueCourses = [...new Set(rows.map(r => r.course))]
    return uniqueCourses.sort()
  }, [rows])

  // Filter and sort
  const filteredRows = useMemo(() => {
    const filtered = rows.filter(row => {
      const normalizedStatus = row.status === 'published' ? 'active' : row.status
      // Status filter
      if (statusFilter !== 'all' && normalizedStatus !== statusFilter) return false

      // Course filter
      if (courseFilter !== 'all' && row.course !== courseFilter) return false

      // Search filter (case-insensitive)
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          row.name.toLowerCase().includes(searchLower) ||
          row.course.toLowerCase().includes(searchLower)
        )
      }

      return true
    })

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }
      if (sortField === 'createdAt') {
        const aTime = new Date(a.createdAt).getTime()
        const bTime = new Date(b.createdAt).getTime()
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime
      }

      // Responses
      return sortDirection === 'asc' ? a.responses - b.responses : b.responses - a.responses
    })

    return sorted
  }, [rows, search, statusFilter, courseFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return (
      <ChevronDown
        className={`w-4 h-4 inline ml-1 transition-transform ${
          sortDirection === 'asc' ? 'rotate-180' : ''
        }`}
      />
    )
  }

  return (
    <div className="rounded-3xl border border-gray-200/70 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-[0_18px_45px_-30px_rgba(47,61,128,0.7)] overflow-hidden transition-all hover:shadow-[0_22px_55px_-28px_rgba(47,61,128,0.75)]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Your Diagnostics
        </h2>
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
          Live Data
        </span>
      </div>

      {/* Filters */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
          <input
            type="text"
            placeholder="Search by name or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
            aria-label="Search diagnostics"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'archived')}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Course
            </label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
              aria-label="Filter by course"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900">
              <th
                className="text-left py-3.5 px-6 font-semibold text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400"
                aria-sort={
                  sortField === 'name'
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                <button
                  onClick={() => handleSort('name')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  Name {getSortIcon('name')}
                </button>
              </th>
              <th className="text-left py-3.5 px-6 font-semibold text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                Course
              </th>
              <th
                className="text-left py-3.5 px-6 font-semibold text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400"
                aria-sort={
                  sortField === 'createdAt'
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                <button
                  onClick={() => handleSort('createdAt')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  Created {getSortIcon('createdAt')}
                </button>
              </th>
              <th
                className="text-right py-3.5 px-6 font-semibold text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400"
                aria-sort={
                  sortField === 'responses'
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                <button
                  onClick={() => handleSort('responses')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  Responses {getSortIcon('responses')}
                </button>
              </th>
              <th className="text-right py-3.5 px-6 font-semibold text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                Completion %
              </th>
              <th className="text-left py-3.5 px-6 font-semibold text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                Weak Topics
              </th>
              <th className="text-right py-3.5 px-6 font-semibold text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onRowClick(row)}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50/60 dark:hover:bg-gray-800/80 cursor-pointer transition-colors"
              >
                <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                  {row.name}
                </td>
                <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                  {row.course}
                </td>
                <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(row.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-right text-sm text-gray-900 dark:text-white font-medium">
                  {row.responses}
                </td>
                <td className="py-4 px-6 text-right">
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200"
                  >
                    {row.completionPct}%
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-wrap gap-1">
                    {row.weakTopics.slice(0, 2).map((topic, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full border border-amber-200/70 bg-amber-50 text-amber-700 shadow-sm"
                      >
                        {topic}
                      </span>
                    ))}
                    {row.weakTopics.length > 2 && (
                      <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-500">
                        +{row.weakTopics.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {row.responses > 0 && (
                      <button
                        onClick={() => onView(row.id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-200 dark:hover:bg-indigo-500/20 rounded-lg transition-colors shadow-sm"
                        aria-label={`View results for ${row.name}`}
                        title="View Results"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDuplicate(row.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors shadow-sm"
                      aria-label={`Duplicate ${row.name}`}
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onArchive(row.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors shadow-sm"
                      aria-label={`Archive ${row.name}`}
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-800">
        {filteredRows.map((row, index) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onRowClick(row)}
            className="p-6 hover:bg-indigo-50/50 dark:hover:bg-gray-800/80 cursor-pointer transition-colors"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {row.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {row.course}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                {new Date(row.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                {row.responses} responses ({row.completionPct}% completion)
              </div>
              {row.weakTopics.length > 0 && (
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Target className="w-4 h-4 mt-0.5" />
                  <div className="flex flex-wrap gap-1.5">
                    {row.weakTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full border border-amber-200/70 bg-amber-50 text-amber-700 shadow-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {row.responses > 0 && (
                <button
                  onClick={() => onView(row.id)}
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  View Results
                </button>
              )}
              <button
                onClick={() => onDuplicate(row.id)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium shadow-sm hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all"
              >
                Duplicate
              </button>
              <button
                onClick={() => onArchive(row.id)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium shadow-sm hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-gray-800 transition-all"
              >
                Archive
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRows.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No diagnostics found matching your filters
          </p>
        </div>
      )}
    </div>
  )
}
