'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { ReactNode } from 'react'

interface StickyFooterCTAProps {
  visible: boolean
  onSubmit: () => void
  disabled?: boolean
  loading?: boolean
  buttonLabel: string
  promptCharacters: number
  meta?: ReactNode
}

export default function StickyFooterCTA({
  visible,
  onSubmit,
  disabled,
  loading,
  buttonLabel,
  promptCharacters,
  meta
}: StickyFooterCTAProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.footer
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-x-0 bottom-0 z-40 bg-white/90 dark:bg-gray-950/95 backdrop-blur border-t border-gray-200 dark:border-gray-800"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 font-medium text-gray-700 dark:text-gray-200">
                {promptCharacters} characters
              </span>
              {meta}
            </div>
            <button
              type="button"
              onClick={onSubmit}
              disabled={disabled || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {buttonLabel}
            </button>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  )
}
