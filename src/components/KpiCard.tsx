'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface KpiCardProps {
  icon: LucideIcon
  iconBgColor: string
  iconColor: string
  label: string
  value: string | number
  subtext?: ReactNode
  delay?: number
}

export default function KpiCard({
  icon: Icon,
  iconBgColor,
  iconColor,
  label,
  value,
  subtext,
  delay = 0
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group relative overflow-hidden rounded-2xl border border-indigo-100/60 dark:border-indigo-500/20 bg-white dark:bg-gray-900 p-6 md:p-8 shadow-[0_18px_45px_-32px_rgba(47,61,128,0.8)] transition-all hover:border-indigo-300/70 hover:shadow-[0_26px_60px_-34px_rgba(47,61,128,0.85)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
      <div className="flex items-start gap-4 relative">
        <div className={`w-10 h-10 ${iconBgColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-500 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-1">
            {value}
          </p>
          {subtext && (
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              {subtext}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
