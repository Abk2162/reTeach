'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X,
  MoreHorizontal,
  Copy,
  Archive,
  ExternalLink,
  RefreshCw,
  Download,
  Share2,
  AlertTriangle
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  Cell
} from 'recharts'
import type { TooltipProps } from 'recharts'
import { fetchPreview } from '@/lib/api'
import type { Preview } from '@/lib/schema'

interface ResultsPreviewModalProps {
  open: boolean
  formId: string | null
  onClose: () => void
  onOpenFullResults?: (formId: string) => void
  onDuplicate?: (formId: string) => void
  onArchive?: (formId: string) => void
  onGenerateRemediation?: (topics: string[]) => void
}

const TARGET_BENCHMARK = 70

export default function ResultsPreviewModal({
  open,
  formId,
  onClose,
  onOpenFullResults,
  onDuplicate,
  onArchive,
  onGenerateRemediation
}: ResultsPreviewModalProps) {
  const [preview, setPreview] = useState<Preview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAllTopics, setShowAllTopics] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      if (!open || !formId) return

      setLoading(true)
      setError(null)
      setMenuOpen(false)
      setShowAllTopics(false)
      setSelectedTopic(null)

      try {
        const data = await fetchPreview(formId)
        if (mounted) {
          setPreview(data)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load preview')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [open, formId])

  const isStale = useMemo(() => {
    if (!preview) return false
    const updated = new Date(preview.updatedAt).getTime()
    const diffDays = (Date.now() - updated) / (1000 * 60 * 60 * 24)
    return diffDays > 14
  }, [preview])

  const lastUpdatedLabel = useMemo(() => {
    if (!preview) return ''
    const updated = new Date(preview.updatedAt).getTime()
    const diffMs = Date.now() - updated
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    const diffWeeks = Math.floor(diffDays / 7)
    if (diffWeeks < 4) return `${diffWeeks}w ago`
    const diffMonths = Math.floor(diffDays / 30)
    return `${diffMonths}mo ago`
  }, [preview])

  const sinceLabel = useMemo(() => {
    if (!preview) return ''
    return new Date(preview.updatedAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    })
  }, [preview])

  const topicsToShow = useMemo(() => {
    if (!preview) return []
    return showAllTopics ? preview.topics : preview.topics.slice(0, 5)
  }, [preview, showAllTopics])

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max)

  const metricTone = (pct: number) => {
    if (pct >= 80) return 'text-green-600 dark:text-green-400'
    if (pct >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const handleGenerateRemediation = () => {
    if (!preview) return
    const focusTopics = preview.topics.slice(0, 2).map(t => t.name)
    if (onGenerateRemediation) {
      onGenerateRemediation(focusTopics)
    } else {
      alert(`Generate remediation set for: ${focusTopics.join(', ')}`)
    }
  }

  const handleDuplicate = () => {
    if (!preview) return
    if (onDuplicate) {
      onDuplicate(preview.id)
    } else {
      alert(`Duplicate diagnostic ${preview.title}`)
    }
  }

  const handleArchive = () => {
    if (!preview) return
    if (onArchive) {
      onArchive(preview.id)
    } else {
      alert(`Archive diagnostic ${preview.title}`)
    }
  }

  type HistogramBin = Preview['distBins'][number]

  const renderHistogramTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) {
      return null
    }
    const bin = payload[0]?.payload as HistogramBin | undefined
    if (!bin) {
      return null
    }
    const [start, end] = bin.range
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <p className="font-medium text-gray-900 dark:text-white">
          {start}–{end}
        </p>
        <p className="text-gray-500 dark:text-gray-400">n = {bin.n}</p>
      </div>
    )
  }

  const distributionColor = (value: number) => {
    if (value >= TARGET_BENCHMARK) return '#2563eb'
    if (value >= 60) return '#f59e0b'
    return '#dc2626'
  }

  const emptyState =
    preview &&
    (preview.responses === 0 || preview.assigned === 0 || preview.topics.length === 0)

  return (
    <AnimatePresence>
      {open && formId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-[99]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="results-preview-title"
          >
            <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <div className="space-y-1">
                  <h2
                    id="results-preview-title"
                    className="text-xl font-semibold text-gray-900 dark:text-white"
                  >
                    {preview?.title ?? 'Diagnostic preview'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {preview?.course ?? 'Course'} · Last updated {lastUpdatedLabel}
                  </p>
                </div>
                <div className="relative flex items-center gap-2" ref={menuRef}>
                  {preview && (
                    <p className="hidden text-xs text-gray-400 sm:block">
                      Since {sinceLabel}
                    </p>
                  )}
                  {onOpenFullResults && preview && (
                    <button
                      onClick={() => onOpenFullResults(preview.id)}
                      className="hidden items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-400 dark:hover:text-blue-300 dark:focus:ring-offset-gray-900 sm:inline-flex"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open full report
                    </button>
                  )}
                  <button
                    onClick={() => setMenuOpen(v => !v)}
                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900"
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900"
                    aria-label="Close preview"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <AnimatePresence>
                    {menuOpen && preview && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-12 top-10 z-10 w-48 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                        role="menu"
                      >
                        <button
                          onClick={() => {
                            handleDuplicate()
                            setMenuOpen(false)
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => {
                            handleArchive()
                            setMenuOpen(false)
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          <Archive className="h-4 w-4" />
                          Archive
                        </button>
                        {onOpenFullResults && (
                          <button
                            onClick={() => {
                              onOpenFullResults(preview.id)
                              setMenuOpen(false)
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-700"
                            role="menuitem"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open full report
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="max-h-[75vh] overflow-y-auto px-6 py-6 md:px-8 md:py-8 space-y-6">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-600 dark:text-gray-400">
                    <RefreshCw className="mb-3 h-6 w-6 animate-spin" />
                    Loading latest results…
                  </div>
                )}

                {!loading && error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/10 dark:text-red-400">
                    {error}
                  </div>
                )}

                {!loading && !error && preview && emptyState && (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400">
                    Awaiting submissions · Share form link with students to collect responses.
                  </div>
                )}

                {!loading && !error && preview && !emptyState && (
                  <>
                    {(preview.responses < 5 || isStale) && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <div>
                            {preview.responses < 5 && (
                              <p>Small sample—treat % cautiously (n={preview.responses}).</p>
                            )}
                            {isStale && (
                              <p className="mt-1">Refresh results · data is older than 14 days.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <section aria-labelledby="key-metrics-heading" className="space-y-4">
                      <h3
                        id="key-metrics-heading"
                        className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Key Metrics
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Completion %
                          </p>
                          <p className={`mt-2 text-2xl font-semibold ${metricTone(preview.completionPct)}`}>
                            {preview.completionPct}% ({preview.responses}/{preview.assigned})
                          </p>
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Since {sinceLabel}
                          </p>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Average Score %
                          </p>
                          <p className={`mt-2 text-2xl font-semibold ${metricTone(preview.avgScorePct)}`}>
                            {preview.avgScorePct}% ({preview.responses}/{preview.assigned})
                          </p>
                          <div className="mt-3">
                            <div className="relative h-2 rounded-full bg-gray-200 dark:bg-gray-800">
                              <div
                                className="absolute top-0 h-full rounded-full bg-blue-500/70 dark:bg-blue-400/60"
                                style={{
                                  left: `${clamp(preview.p25)}%`,
                                  width: `${Math.max(clamp(preview.p75) - clamp(preview.p25), 2)}%`
                                }}
                              />
                              <div
                                className="absolute top-0 h-full w-[2px] bg-blue-700 dark:bg-blue-300"
                                style={{ left: `${clamp(preview.p50)}%` }}
                              />
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Median {preview.p50} · p25 {preview.p25} · p75 {preview.p75}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            At-Risk Students
                          </p>
                          <p
                            className={`mt-2 text-2xl font-semibold ${metricTone(
                              preview.assigned > 0 ? 100 - (preview.atRisk / preview.assigned) * 100 : 0
                            )}`}
                          >
                            {preview.atRisk} students (
                            {preview.assigned > 0 ? Math.round((preview.atRisk / preview.assigned) * 100) : 0}
                            %)
                          </p>
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Score &lt;60% or missing work
                          </p>
                        </div>
                      </div>
                    </section>

                    <section aria-labelledby="topic-focus-heading" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3
                          id="topic-focus-heading"
                          className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                        >
                          Topic Focus
                        </h3>
                        {preview.topics.length > 5 && (
                          <button
                            onClick={() => setShowAllTopics(v => !v)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-400 dark:hover:text-blue-300 dark:focus:ring-offset-gray-900"
                          >
                            {showAllTopics ? 'Collapse' : 'View all topics'}
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {topicsToShow.map(topic => {
                          const tone = metricTone(topic.correctPct)
                          return (
                            <div
                              key={topic.name}
                              onClick={() => setSelectedTopic(topic.name)}
                              className={`rounded-xl border border-transparent px-4 py-3 transition-colors hover:border-blue-200 hover:bg-blue-50/60 focus-within:border-blue-300 dark:hover:bg-blue-900/20 ${
                                selectedTopic === topic.name
                                  ? 'border-blue-300 bg-blue-50/60 dark:border-blue-700/70 dark:bg-blue-900/20'
                                  : 'bg-white dark:bg-gray-900'
                              }`}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  setSelectedTopic(topic.name)
                                }
                              }}
                            >
                              <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-200">
                                <span className="font-medium">{topic.name}</span>
                                <span className={`font-semibold ${tone}`}>
                                  {topic.correctPct}% (n={topic.n})
                                </span>
                              </div>
                              <div className="relative mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800">
                                <div
                                  className="absolute inset-y-0 rounded-full"
                                  style={{
                                    width: `${topic.correctPct}%`,
                                    backgroundColor:
                                      topic.correctPct >= 80
                                        ? '#16a34a'
                                        : topic.correctPct >= 60
                                        ? '#f59e0b'
                                        : '#dc2626'
                                  }}
                                />
                                <div
                                  className="absolute top-0 bottom-0 w-[2px] bg-gray-500"
                                  style={{ left: `${TARGET_BENCHMARK}%` }}
                                />
                              </div>
                              <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Topic · n={topic.n}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    alert(`Assign practice for ${topic.name}`)
                                  }}
                                  className="font-medium text-blue-600 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-400 dark:focus:ring-offset-gray-900"
                                >
                                  Assign practice
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {selectedTopic && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
                          <div className="flex items-start justify-between gap-4">
                            <p>
                              Deep dive for <span className="font-semibold">{selectedTopic}</span> coming soon.
                              Surface question-level distractor analysis here.
                            </p>
                            <button
                              onClick={() => setSelectedTopic(null)}
                              className="rounded-md px-2 py-1 text-xs font-medium text-blue-700 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-300 dark:focus:ring-offset-gray-900"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </section>

                    <section aria-labelledby="distribution-heading" className="space-y-4">
                      <h3
                        id="distribution-heading"
                        className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Distribution Snapshot
                      </h3>
                      <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                        <div className="h-36">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={preview.distBins} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                              <XAxis dataKey="range" hide />
                              <Tooltip cursor={{ fill: 'transparent' }} content={renderHistogramTooltip} />
                              <Bar dataKey="n" radius={[4, 4, 0, 0]} barSize={18}>
                                {preview.distBins.map((bin, index) => (
                                  <Cell
                                    key={`bin-${index}`}
                                    fill={distributionColor((bin.range[0] + bin.range[1]) / 2)}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                          Median {preview.p50} · p25 {preview.p25} · p75 {preview.p75}
                        </p>
                      </div>
                    </section>

                    {preview.subgroups && preview.subgroups.length > 0 && (
                      <section aria-labelledby="subgroup-heading" className="space-y-4">
                        <h3
                          id="subgroup-heading"
                          className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                        >
                          Performance by Subgroup
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-3">
                          {preview.subgroups.slice(0, 3).map(subgroup => {
                            const delta = subgroup.scorePct - preview.avgScorePct
                            const deltaLabel =
                              delta === 0 ? 'On par' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)} vs class`
                            const barWidth = Math.max(Math.min(subgroup.scorePct, 100), 0)
                            return (
                              <div
                                key={subgroup.name}
                                className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                              >
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {subgroup.name}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  n={subgroup.n}
                                </p>
                                <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-800">
                                  <div
                                    className="h-full rounded-full bg-blue-500 dark:bg-blue-400"
                                    style={{ width: `${barWidth}%` }}
                                  />
                                </div>
                                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                  {subgroup.scorePct.toFixed(1)}%
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{deltaLabel}</p>
                              </div>
                            )
                          })}
                        </div>
                      </section>
                    )}

                    <section aria-labelledby="actions-heading" className="space-y-3">
                      <h3
                        id="actions-heading"
                        className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Actions
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleGenerateRemediation}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                        >
                          Generate remediation set
                        </button>
                        <button
                          onClick={() => alert('Export CSV coming soon')}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900"
                        >
                          <Download className="h-4 w-4" />
                          Export CSV
                        </button>
                        <button
                          onClick={() => alert('Share to Google Classroom coming soon')}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900"
                        >
                          <Share2 className="h-4 w-4" />
                          Share to Google Classroom
                        </button>
                      </div>
                    </section>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
