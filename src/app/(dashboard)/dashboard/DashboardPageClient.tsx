'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import HeroReadiness from '@/components/HeroReadiness'
import KpiCard from '@/components/KpiCard'
import DiagnosticsTable from '@/components/DiagnosticsTable'
import DiagSidePanel from '@/components/dashboard/DiagSidePanel'
import { Target, Trophy } from 'lucide-react'
import type { DiagnosticRow, TopicStat } from '@/lib/schema'
import { fetchDiagnosticsOverview, fetchResults, deleteForm } from '@/lib/api'

export default function DashboardPageClient() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [diagnostics, setDiagnostics] = useState<DiagnosticRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDiag, setSelectedDiag] = useState<DiagnosticRow | null>(null)
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [miniStats, setMiniStats] = useState<TopicStat[]>([])
  const [statsLoading, setStatsLoading] = useState(false)
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const [courseName, setCourseName] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      window.location.href = '/login'
    }
  }, [status])

  // Check onboarding status
  useEffect(() => {
    let isMounted = true

    const checkOnboarding = async () => {
      if (status === 'loading' || !session?.user?.email) {
        return
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/teachers/${session.user.email}/onboarding-status`
        )

        if (!response.ok) {
          setCheckingOnboarding(false)
          return
        }

        const data = await response.json()

        if (!isMounted) return

        // Redirect to onboarding if not completed
        if (!data.has_completed_onboarding) {
          router.replace('/onboarding')
          return
        }

        // Set course name if available
        if (data.course_name) {
          setCourseName(data.course_name)
        }

        setCheckingOnboarding(false)
      } catch (err) {
        console.error('Failed to check onboarding status:', err)
        setCheckingOnboarding(false)
      }
    }

    checkOnboarding()

    return () => {
      isMounted = false
    }
  }, [session, status, router])

  useEffect(() => {
    let isMounted = true

    const loadDiagnostics = async () => {
      try {
        setLoading(true)
        const data = await fetchDiagnosticsOverview()
        if (!isMounted) return
        setDiagnostics(data)
        setError(null)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to load diagnostics')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Only load diagnostics if onboarding check is complete
    if (!checkingOnboarding) {
      loadDiagnostics()
    }

    return () => {
      isMounted = false
    }
  }, [checkingOnboarding])

  const courseDiagnostics = useMemo(() => {
    return diagnostics.filter((diagnostic) => {
      const isActive =
        diagnostic.status === 'active' || diagnostic.status === 'published'
      return isActive
    })
  }, [diagnostics])

  const readinessPct = useMemo(() => {
    const withResponses = courseDiagnostics.filter((d) => d.responses > 0 && d.avgScore !== undefined)
    if (withResponses.length === 0) return 0
    const avgScore =
      withResponses.reduce((sum, d) => sum + (d.avgScore ?? 0), 0) /
      withResponses.length
    return Math.round(avgScore)
  }, [courseDiagnostics])

  const topWeakTopic = useMemo(() => {
    const topicCounts = new Map<string, number>()
    courseDiagnostics.forEach((diag) => {
      diag.weakTopics.forEach((topic) => {
        if (!topic) return
        topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1)
      })
    })

    if (topicCounts.size === 0) return null

    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  }, [courseDiagnostics])

  const strongestTopic = useMemo(() => {
    const topicScores = new Map<string, number>()
    courseDiagnostics.forEach((diag) => {
      diag.strongTopics.forEach((topic, index) => {
        if (!topic) return
        const weight = Math.max(1, 3 - index)
        topicScores.set(topic, (topicScores.get(topic) ?? 0) + weight)
      })
    })

    if (topicScores.size === 0) return null

    return Array.from(topicScores.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  }, [courseDiagnostics])

  useEffect(() => {
    let isMounted = true

    const loadMiniStats = async () => {
      if (!selectedDiag || selectedDiag.responses === 0) {
        setMiniStats([])
        setStatsLoading(false)
        return
      }

      try {
        setStatsLoading(true)
        const data = await fetchResults(selectedDiag.slug ?? selectedDiag.id)
        if (!isMounted) return
        setMiniStats(data.topics.slice(0, 5))
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to fetch diagnostic stats', err)
        setMiniStats([])
      } finally {
        if (isMounted) {
          setStatsLoading(false)
        }
      }
    }

    loadMiniStats()

    return () => {
      isMounted = false
    }
  }, [selectedDiag])

  const handleCreate = () => {
    router.push('/create')
  }

  const handleView = (id: string) => {
    const diag = diagnostics.find((d) => d.id === id)
    if (diag) {
      setSelectedDiag(diag)
      setSidePanelOpen(true)
    }
  }

  const handleRowClick = (row: DiagnosticRow) => {
    setSelectedDiag(row)
    setSidePanelOpen(true)
  }

  const handleCloseSidePanel = () => {
    setSidePanelOpen(false)
    setTimeout(() => setSelectedDiag(null), 300)
  }

  const handleViewResultsFromPanel = () => {
    if (selectedDiag) {
      router.push(`/results?formId=${selectedDiag.slug ?? selectedDiag.id}`)
    }
  }

  const handleEditFromPanel = () => {
    if (selectedDiag) {
      router.push(`/review?id=${selectedDiag.slug ?? selectedDiag.id}`)
    }
  }

  const handleDelete = async (slug: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this diagnostic? This action cannot be undone.'
    )
    if (!confirmDelete) return

    try {
      setDeletingSlug(slug)
      await deleteForm(slug)
      setDiagnostics((prev) => prev.filter((diag) => diag.slug !== slug))
      if (selectedDiag?.slug === slug) {
        setSelectedDiag(null)
        setSidePanelOpen(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete diagnostic')
    } finally {
      setDeletingSlug(null)
    }
  }

  const handleCourseNameChange = async (newName: string) => {
    if (!session?.user?.email) return

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers/${session.user.email}/course-name`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ course_name: newName }),
    })

    if (!response.ok) {
      throw new Error('Failed to update course name')
    }

    setCourseName(newName)
  }


  // Don't render anything if not authenticated
  if (status === 'unauthenticated' || (status !== 'loading' && !session?.user?.email)) {
    return null
  }

  // Show loading while checking auth/onboarding
  if (status === 'loading' || checkingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-12">
        <HeroReadiness
          courseName={courseName || 'My Course'}
          readinessPct={readinessPct}
          onCreateNew={handleCreate}
          onCourseNameChange={handleCourseNameChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strongestTopic && (
            <KpiCard
              icon={Trophy}
              iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
              iconColor="text-emerald-600 dark:text-emerald-400"
              label="Strongest Topic"
              value={strongestTopic}
              subtext={<span className="text-xs">Highest-performing topic this term</span>}
              delay={0.1}
            />
          )}

          {topWeakTopic && (
            <KpiCard
              icon={Target}
              iconBgColor="bg-red-100 dark:bg-red-900/30"
              iconColor="text-red-600 dark:text-red-400"
              label="Top Weak Topic"
              value={topWeakTopic}
              delay={0.2}
            />
          )}
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
              Loading diagnostics...
            </div>
          )}

          <DiagnosticsTable
            rows={courseDiagnostics}
            onRowClick={handleRowClick}
            onView={handleView}
            onDelete={handleDelete}
            deletingId={deletingSlug}
          />
        </div>

        <DiagSidePanel
          open={sidePanelOpen}
          diag={selectedDiag}
          miniStats={miniStats}
          loadingTopics={statsLoading}
          onClose={handleCloseSidePanel}
          onViewResults={handleViewResultsFromPanel}
          onEdit={handleEditFromPanel}
          onDelete={() => {
            if (selectedDiag) {
              handleDelete(selectedDiag.slug ?? selectedDiag.id)
            }
          }}
          deletingId={deletingSlug}
        />
      </div>
    </DashboardLayout>
  )
}
