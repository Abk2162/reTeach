'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

interface AppHeaderProps {
  title?: string
  showBack?: boolean
  backTo?: string
  variant?: 'default' | 'docs' | 'minimal'
}

export default function AppHeader({
  title = 'reTeach', 
  showBack = false, 
  backTo,
  variant = 'default'
}: AppHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backTo) {
      router.push(backTo)
    } else {
      router.back()
    }
  }

  const handleLogoClick = () => {
    // Check if user is authenticated by looking for user data in localStorage
    const userData = localStorage.getItem('user')
    const oauthToken = localStorage.getItem('oauth_token')
    
    if (userData && oauthToken) {
      // User is logged in, go to dashboard
      router.push('/dashboard')
    } else {
      // User is not logged in, go to landing page
      router.push('/')
    }
  }

  const getLogoColor = () => {
    switch (variant) {
      case 'docs':
        return 'text-gray-900 dark:text-white'
      case 'minimal':
        return 'text-gray-900 dark:text-white'
      default:
        return 'text-gray-900 dark:text-white'
    }
  }

  const getBgClass = () => {
    switch (variant) {
      case 'docs':
        return 'bg-white/60 dark:bg-black/30'
      case 'minimal':
        return 'bg-white/90 dark:bg-black/40'
      default:
        return 'bg-white/90 dark:bg-black/40'
    }
  }

  return (
    <header className={`sticky top-0 z-30 backdrop-blur border-b border-gray-100 dark:border-gray-800 ${getBgClass()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo - Smart navigation based on auth state */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-0 group"
          >
            <img
              src="/logo.png"
              alt="reTeach logo" 
              className="w-10 h-10 transition-transform group-hover:scale-110 object-contain"
            />
            <span className={`text-2xl font-bold tracking-tight ${getLogoColor()}`}>{title}</span>
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Back Button - positioned on the right */}
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          {variant === 'docs' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
              DOCS
            </span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
