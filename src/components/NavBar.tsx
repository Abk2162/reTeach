'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, BarChart3, LayoutDashboard, MessageSquare } from 'lucide-react'
import UserMenu from './UserMenu'

export default function NavBar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Diagnostics', icon: LayoutDashboard },
    { href: '/create', label: 'Create', icon: Sparkles },
    { href: '/results', label: 'Results', icon: BarChart3 }
  ]

  return (
    <header className="sticky top-0 z-30 backdrop-blur border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/logo.png"
            alt="reTeach logo"
            className="w-10 h-10 transition-transform group-hover:scale-110 object-contain"
          />
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            reTeach
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <UserMenu />
        </div>

        {/* Mobile menu (simplified - just show active page) */}
        <div className="md:hidden flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          {navItems.find(item => item.href === pathname)?.label || 'Menu'}
        </div>
      </div>
    </header>
  )
}
