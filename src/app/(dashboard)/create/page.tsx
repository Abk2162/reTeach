'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, BookOpen, ArrowLeft, Loader2, ArrowRight, HelpCircle } from 'lucide-react'
import DiagnosticForm from '@/components/DiagnosticForm'
import HelpSidebar from '@/components/HelpSidebar'
import NotificationPopup from '@/components/NotificationPopup'
import { generateQuestions, API_BASE_URL } from '@/lib/api'
import { useStore } from '@/lib/store'
import type { Topic } from '@/lib/schema'

interface Notification {
  id: string
  label: string
  severity: 'info' | 'warn' | 'error'
  timestamp: Date
}

const defaultWeights = [0.4, 0.35, 0.25]

interface PromptConfig {
  title: string
  focus: string
  textbook: string
  chapters: string
  gradeLevel: string
  questionCount: number
  notes: string
  assessmentType: 'survey' | 'quiz'
  useTextbookPdf: boolean
  textbookFile: File | null
}

const initialConfig: PromptConfig = {
  title: 'Untitled Diagnostic',
  focus: '',
  textbook: '',
  chapters: '',
  gradeLevel: 'Grade 10',
  questionCount: 20,
  notes: '',
  assessmentType: 'quiz',
  useTextbookPdf: false,
  textbookFile: null
}

export default function CreateDiagnosticPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'prompt' | 'upload'>('prompt')
  const [config, setConfig] = useState<PromptConfig>(initialConfig)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [helpOpen, setHelpOpen] = useState(false)
  const setTopics = useStore((state) => state.setTopics)
  const setQuestions = useStore((state) => state.setQuestions)

  const updateConfig = <Key extends keyof PromptConfig>(key: Key, value: PromptConfig[Key]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const addNotification = (label: string, severity: 'info' | 'warn' | 'error' = 'warn') => {
    const notification: Notification = {
      id: Date.now().toString(),
      label,
      severity,
      timestamp: new Date()
    }
    setNotifications((prev) => [...prev, notification])
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/dashboard')
    }
  }

  const handleGenerate = async () => {
    if (!config.focus.trim()) {
      setError('Describe what you want to assess so we can build targeted questions.')
      return
    }


    // Validate textbook PDF if checkbox is checked
    if (config.useTextbookPdf && !config.textbookFile) {
      addNotification('Please upload a textbook PDF or uncheck the option', 'error')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let textbookId: string | null = null

      // If user uploaded a textbook PDF, upload it first and get topics from it
      if (config.useTextbookPdf && config.textbookFile) {
        const formData = new FormData()
        formData.append('file', config.textbookFile)

        const uploadResponse = await fetch(`${API_BASE_URL}/api/textbooks/upload`, {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload textbook')
        }

        const uploadData = await uploadResponse.json()
        textbookId = uploadData.textbook_id

        // Use topics from textbook
        const normalizedTopics: Topic[] = uploadData.topics.map((t: any) => ({
          id: t.id,
          name: t.name,
          weight: t.weight,
          prereqs: t.prereqs || []
        }))

        setTopics(normalizedTopics)

        // Generate questions from textbook topics (5 per topic)
        const totalQuestions = normalizedTopics.length * 5
        const questions = await generateQuestions(normalizedTopics, totalQuestions, config.assessmentType, textbookId)
        setQuestions(questions)
      } else {
        // Generate topics from manual prompt
        const topicSeeds = [
          config.focus,
          ...config.chapters
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)
        ]

        const normalizedTopics: Topic[] = topicSeeds.slice(0, 3).map((topicName, index) => ({
          id: `prompt-${index}`,
          name: topicName,
          weight: defaultWeights[index] ?? 0.25,
          prereqs: []
        }))

        if (normalizedTopics.length === 0) {
          normalizedTopics.push({
            id: 'prompt-0',
            name: config.focus,
            weight: 1,
            prereqs: []
          })
        }

        setTopics(normalizedTopics)

        // Generate questions with AI web search (5 per topic)
        const totalQuestions = normalizedTopics.length * 5
        const questions = await generateQuestions(normalizedTopics, totalQuestions, config.assessmentType)
        setQuestions(questions)
      }

      router.push(`/review?title=${encodeURIComponent(config.title)}&type=${config.assessmentType}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate diagnostic')
    } finally {
      setLoading(false)
    }
  }

  const promptCharacters = config.focus.length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Notification Popup - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <NotificationPopup notifications={notifications} onDismiss={dismissNotification} />
      </div>

      <main className="mx-auto w-full max-w-2xl space-y-8 px-6 py-10 md:px-12">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <section className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Create a Diagnostic
            </h1>
            <p className="text-sm text-muted-foreground">
              Build questions from a prompt or syllabus.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHelpOpen((prev) => !prev)}
            aria-expanded={helpOpen}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </button>
        </section>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-gray-200 p-1 dark:border-gray-800 dark:bg-gray-900">
            <button
              type="button"
              onClick={() => setActiveTab('prompt')}
              className={`flex min-w-[150px] items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'prompt'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Prompt Builder
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload')
                router.push('/upload')
              }}
              className={`flex min-w-[150px] items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Upload Syllabus
            </button>
          </div>
          <button
            type="button"
            onClick={() => router.push('/upload')}
            className="text-xs font-medium text-gray-500 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300"
          >
            Prefer the classic flow?
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'prompt' && (
            <motion.div
              key="prompt-form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <DiagnosticForm
                config={config}
                onConfigChange={updateConfig}
                promptCharacters={promptCharacters}
                error={error}
              />
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading || !config.focus.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Crafting questions...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Generate questions
                    </>
                  )}
                </button>
                <p className="text-xs text-muted-foreground">
                  You can edit before publishing.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="md:hidden">
          <HelpSidebar />
        </div>
        <AnimatePresence>
          {helpOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex justify-end bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="flex-1"
                onClick={() => setHelpOpen(false)}
                aria-hidden="true"
              />
              <motion.aside
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                className="h-full w-full max-w-sm overflow-y-auto border-l border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Guidance
                  </h2>
                  <button
                    type="button"
                    onClick={() => setHelpOpen(false)}
                    className="rounded-full px-3 py-1 text-xs font-medium text-gray-500 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300"
                  >
                    Close
                  </button>
                </div>
                <HelpSidebar />
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
