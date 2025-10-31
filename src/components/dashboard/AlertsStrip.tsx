'use client'

import { useState } from 'react'
import { X, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Alert {
  label: string
  severity: 'info' | 'warn' | 'error'
}

interface AlertsStripProps {
  alerts: Alert[]
}

export default function AlertsStrip({ alerts }: AlertsStripProps) {
  const [dismissed, setDismissed] = useState(false)

  if (alerts.length === 0 || dismissed) return null

  // Determine highest severity
  const highestSeverity = alerts.some(a => a.severity === 'error') ? 'error'
    : alerts.some(a => a.severity === 'warn') ? 'warn'
    : 'info'

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-950/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-900 dark:text-red-200',
          icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        }
      case 'warn':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-900 dark:text-amber-200',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        }
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-900 dark:text-blue-200',
          icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        }
    }
  }

  const styles = getSeverityStyles(highestSeverity)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`flex items-start justify-between p-4 rounded-xl border ${styles.bg} ${styles.border}`}>
          <div className="flex items-start gap-3 flex-1">
            {styles.icon}
            <div className="space-y-1">
              {alerts.map((alert, index) => (
                <p key={index} className={`text-sm ${index === 0 ? 'font-medium' : ''} ${styles.text}`}>
                  {alert.label}
                </p>
              ))}
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex-shrink-0 ${styles.text}`}
            aria-label="Dismiss alerts"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
