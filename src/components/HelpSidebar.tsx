'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Compass, NotebookPen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEYS = {
  how: 'diagnostic-help-how',
  tips: 'diagnostic-help-tips'
} as const

const sections = [
  {
    id: 'how',
    title: 'How it works',
    icon: Compass,
    points: [
      'Prompt becomes learning objectives automatically.',
      'Chapters ground questions in your resource.',
      'You review everything before sharing.'
    ]
  },
  {
    id: 'tips',
    title: 'Prompt tips',
    icon: NotebookPen,
    points: [
      'Lead with the learning outcome.',
      'Mention misconceptions or pitfalls.',
      'Note tone, format, or difficulty.'
    ]
  }
] as const

const initialState = {
  how: false,
  tips: false
}

type SectionState = typeof initialState

export default function HelpSidebar() {
  const [expanded, setExpanded] = useState<SectionState>(initialState)

  useEffect(() => {
    const stored = sections.reduce<Partial<SectionState>>((acc, section) => {
      const saved = localStorage.getItem(STORAGE_KEYS[section.id as keyof SectionState])
      if (saved !== null) {
        acc[section.id as keyof SectionState] = saved === 'true'
      }
      return acc
    }, {})
    setExpanded((prev) => ({ ...prev, ...stored }))
  }, [])

  const handleToggle = (key: keyof SectionState) => {
    setExpanded((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(STORAGE_KEYS[key], String(next[key]))
      return next
    })
  }

  return (
    <aside className="space-y-4">
      {sections.map(({ id, title, icon: Icon, points }) => {
        const isOpen = expanded[id as keyof SectionState]

        return (
          <div
            key={id}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => handleToggle(id as keyof SectionState)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Icon className="h-4 w-4 text-indigo-500" />
                {title}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
                    <ul className="space-y-2 text-xs md:text-sm leading-snug text-gray-600 dark:text-gray-400">
                      {points.map((point, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-300 dark:bg-indigo-500" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </aside>
  )
}
