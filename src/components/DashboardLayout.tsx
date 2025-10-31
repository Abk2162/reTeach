'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Sparkles, BarChart3, LayoutDashboard, List, Users, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import UserMenu from './UserMenu'

interface DashboardLayoutProps {
  children: React.ReactNode
  navbarSlot?: React.ReactNode
}

export default function DashboardLayout({ children, navbarSlot }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const sidebarWidth = 224 // w-56

  const menuItems = [
    { href: '/dashboard', label: 'All Diagnostics', icon: LayoutDashboard },
    { href: '/create', label: 'Create Diagnostic', icon: Sparkles },
    { href: '/students', label: 'Students', icon: Users },
    { href: '/results', label: 'Results', icon: BarChart3 }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -sidebarWidth }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="fixed left-0 top-16 bottom-0 w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-30 shadow-xl"
        style={{ pointerEvents: sidebarOpen ? 'auto' : 'none' }}
      >
        <div className="px-4 py-6 space-y-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            <List className="w-4 h-4" />
            Menu
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </motion.aside>

      {/* Main Content Container */}
      <div className="relative">
        {/* Fixed Navbar */}
        <header className="sticky top-0 z-40 backdrop-blur border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Left: Logo + Hamburger */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className={`w-6 h-6 transition-transform duration-300 ${sidebarOpen ? 'rotate-90' : ''}`} />
              </button>

              <Link href="/dashboard" className="flex items-center gap-2 group">
                <img
                  src="/logo.png"
                  alt="reTeach logo"
                  className="w-10 h-10 transition-transform group-hover:scale-110 object-contain"
                />
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  reTeach
                </span>
              </Link>
            </div>

            {/* Right: Course selector slot + user menu */}
            <div className="flex items-center gap-4">
              {navbarSlot}
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main content with conditional left margin */}
        <motion.main
          initial={false}
          animate={{ paddingLeft: sidebarOpen ? sidebarWidth : 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="transition-[padding-left]"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
