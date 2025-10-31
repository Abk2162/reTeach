'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import StudentsTable from '@/components/StudentsTable'

export default function StudentsPage() {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="mx-auto w-full max-w-7xl space-y-8 px-6 py-10 md:px-8">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Page Header */}
        <section className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
            Students
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Students who have submitted diagnostic forms
          </p>
        </section>

        {/* Students Table */}
        <StudentsTable />
      </main>
    </div>
  )
}
