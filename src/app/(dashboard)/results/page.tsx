'use client'

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Loader2,
  RefreshCw,
  ArrowLeft,
  Users,
  Target,
  AlertTriangle
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts'
import { fetchResults } from '@/lib/api'
import type { TopicStat } from '@/lib/schema'

const barColorForValue = (value: number) => {
  if (value >= 80) return '#10b981' // green
  if (value >= 60) return '#f59e0b' // amber
  return '#ef4444' // red
}

function ResultsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const formId = searchParams.get('formId') || 'demo'

  const [stats, setStats] = useState<TopicStat[]>([])
  const [formTitle, setFormTitle] = useState<string>('Results Overview')
  const [responseCount, setResponseCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadResults = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchResults(formId)
      setStats(data.topics)
      setFormTitle(data.formTitle)
      setResponseCount(data.totalResponses ?? 0)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch results'
      if (message.toLowerCase().includes('not found')) {
        setError('No results yet. Share your diagnostic to gather responses.')
      } else {
        setError(message)
      }
      setStats([])
      setFormTitle('Results Overview')
      setResponseCount(0)
    } finally {
      setLoading(false)
    }
  }, [formId])

  useEffect(() => {
    loadResults()
  }, [loadResults])

  const totalResponses = useMemo(() => {
    return responseCount
  }, [responseCount])

  const averageScore = useMemo(() => {
    if (stats.length === 0) return 0
    return stats.reduce((sum, stat) => sum + stat.correctPct, 0) / stats.length
  }, [stats])

  const strongestTopic = useMemo(() => {
    if (stats.length === 0) return null
    return stats.reduce((max, stat) => (stat.correctPct > max.correctPct ? stat : max), stats[0])
  }, [stats])

  const weakestTopic = useMemo(() => {
    if (stats.length === 0) return null
    return stats.reduce((min, stat) => (stat.correctPct < min.correctPct ? stat : min), stats[0])
  }, [stats])

  if (loading && stats.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header className="space-y-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300 transition-colors"
            aria-label="Back to diagnostics"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Diagnostics
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">
                {formTitle}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                {totalResponses > 0
                  ? `Live diagnostic results from ${totalResponses} response${totalResponses === 1 ? '' : 's'}.`
                  : 'Results populate automatically as students submit their diagnostics.'}
              </p>
            </div>
            <button
              onClick={loadResults}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:border-indigo-200 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            {error}
          </div>
        )}

        {!loading && !error && stats.length === 0 && (
          <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-500/30 bg-indigo-50/60 px-4 py-6 text-sm text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
            No submissions yet. Share your form link or QR code—results will appear here as soon as responses come in.
          </div>
        )}

        {stats.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  Average Score
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {averageScore.toFixed(1)}%
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Target className="w-4 h-4" />
                  Top Topic: {strongestTopic?.topic ?? '—'}
                </p>
              </div>
              <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  Total Responses
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {totalResponses}
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  Across all topics in this diagnostic
                </p>
              </div>
              <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  Needs Attention
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {weakestTopic?.topic ?? '—'}
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <AlertTriangle className="w-4 h-4" />
                  Avg score {weakestTopic ? `${weakestTopic.correctPct.toFixed(1)}%` : 'n/a'}
                </p>
              </div>
            </div>

            {totalResponses < 5 && (
              <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                Small sample size (n &lt; 5). Treat percentages as directional only.
              </div>
            )}

            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-6 shadow-[0_22px_60px_-35px_rgba(47,61,128,0.55)]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-4">
                Topic Score Distribution
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats} margin={{ top: 16, right: 16, left: 0, bottom: 48 }}>
                    <XAxis
                      dataKey="topic"
                      textAnchor="middle"
                      height={70}
                      tick={false}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 16px 40px rgba(15,23,42,0.12)'
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Correct']}
                      labelFormatter={(label: string) => label}
                    />
                    <Bar dataKey="correctPct" barSize={28}>
                      {stats.map((stat, index) => (
                        <Cell key={`cell-${index}`} fill={barColorForValue(stat.correctPct)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  Topic Detail
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Ordered by performance descending
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500 dark:text-gray-400">
                      <th className="py-3 px-4 font-semibold">Topic</th>
                      <th className="py-3 px-4 font-semibold text-right">Responses</th>
                      <th className="py-3 px-4 font-semibold text-right">Correct %</th>
                      <th className="py-3 px-4 font-semibold">Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...stats].sort((a, b) => b.correctPct - a.correctPct).map((stat, index) => {
                      const signal =
                        stat.correctPct >= 80 ? 'Mastery' :
                        stat.correctPct >= 70 ? 'On Track' :
                        stat.correctPct >= 60 ? 'Review' : 'Focus'
                      const tone =
                        stat.correctPct >= 80
                          ? 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10'
                          : stat.correctPct >= 70
                          ? 'text-blue-600 dark:text-blue-300 bg-blue-500/10'
                          : stat.correctPct >= 60
                          ? 'text-amber-600 dark:text-amber-300 bg-amber-500/10'
                          : 'text-rose-600 dark:text-rose-300 bg-rose-500/10'

                      return (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50/40 dark:hover:bg-gray-800/60 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                            {stat.topic}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                            {stat.n}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                            {stat.correctPct.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
                              {signal}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  )
}


export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsPageContent />
    </Suspense>
  )
}
