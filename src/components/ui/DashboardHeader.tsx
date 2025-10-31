'use client'

import { LogOut } from 'lucide-react'
import BrandLink from '@/components/ui/BrandLink'

interface DashboardHeaderProps {
  organizationName: string
  userEmail: string
  userName?: string
  mode: string
  onLogout: () => void
}

export default function DashboardHeader({ 
  organizationName, 
  userEmail, 
  userName, 
  mode, 
  onLogout 
}: DashboardHeaderProps) {

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/60 dark:bg-black/30 border-b border-gray-100 dark:border-white/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BrandLink />
            {/* Organization Info */}
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {userName ? `Welcome, ${userName}!` : organizationName}
              </div>
              <div className="text-[11px] text-gray-500">{userEmail} • {mode} mode</div>
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
    </header>
  )
}
