'use client'

import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PublishCard from '@/components/PublishCard'
import QRCodeCard from '@/components/QRCodeCard'
import { useStore } from '@/lib/store'
import { ArrowLeft, BarChart3 } from 'lucide-react'

function PublishPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const formUrl = useStore((state) => state.formUrl)
  const formSlug = useStore((state) => state.formSlug)
  const setPublishInfo = useStore((state) => state.setPublishInfo)
  const [checkedQuery, setCheckedQuery] = useState(false)

  const queryFormUrl = searchParams?.get('formUrl')
  const querySlug = searchParams?.get('slug')
  const queryFormId = searchParams?.get('formId')

  const hasQueryParams = useMemo(() => {
    if (!searchParams) return false
    const iterator = searchParams.keys()
    return !iterator.next().done
  }, [searchParams])

  const hydrationAttemptedRef = useRef(false)

  useEffect(() => {
    if (hydrationAttemptedRef.current) return

    const finish = () => {
      hydrationAttemptedRef.current = true
      setCheckedQuery(true)
    }

    // Case 1: already in store
    if (formSlug) {
      if (!formUrl && typeof window !== 'undefined') {
        const derivedUrl = `${window.location.origin}/form/${formSlug}`
        setPublishInfo({ formUrl: derivedUrl, formSlug, formId: formSlug })
      }
      finish()
      return
    }

    // Case 2: from URL (derive URL if missing)
    if (querySlug) {
      const computedUrl =
        queryFormUrl || (typeof window !== 'undefined' ? `${window.location.origin}/form/${querySlug}` : '')
      setPublishInfo({
        formUrl: computedUrl,
        formSlug: querySlug,
        formId: queryFormId || querySlug
      })
      finish()
      return
    }

    // Case 3: localStorage fallback
    try {
      if (typeof window !== 'undefined' && window?.localStorage) {
        const raw = window.localStorage.getItem('publishInfo')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?.formSlug) {
            const computedUrl =
              parsed.formUrl || `${window.location.origin}/form/${parsed.formSlug}`
            setPublishInfo({
              formUrl: computedUrl,
              formSlug: parsed.formSlug,
              formId: parsed.formId || parsed.formSlug
            })
            finish()
            return
          }
        }
      }
    } catch (_) {
      // ignore storage errors
    }

    // Nothing available; mark finished and let redirect handle
    finish()
  }, [
    formUrl,
    formSlug,
    queryFormUrl,
    querySlug,
    queryFormId,
    hasQueryParams,
    setPublishInfo
  ])

  useEffect(() => {
    // Only navigate away if we truly cannot recover publish info
    // Guard against race: if slug is in the URL, do not redirect yet
    if (checkedQuery && !formSlug && !querySlug) {
      router.replace('/preview')
    }
  }, [checkedQuery, formSlug, querySlug, router])

  const effectiveFormUrl =
    formUrl || (typeof window !== 'undefined' && formSlug ? `${window.location.origin}/form/${formSlug}` : null)

  if (!formSlug || !effectiveFormUrl) {
    return null // Either hydrating or redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/preview')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400
              hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            aria-label="Back to preview"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Preview
          </button>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Form Published!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your diagnostic assessment has been created. Share the form with students and view results when they submit.
          </p>
        </div>

        <div className="space-y-6">
          {/* URLs */}
          <div className="card bg-white dark:bg-gray-900 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Share Link
            </h2>
            <PublishCard formUrl={effectiveFormUrl} />
          </div>

          {/* QR Code */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <QRCodeCard url={effectiveFormUrl} title="Form QR Code" />
            </div>

            <div className="card bg-white dark:bg-gray-900 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Next Steps
              </h2>
              <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">1.</span>
                  <span>Share the form URL or QR code with your students</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">2.</span>
                  <span>Students complete the diagnostic assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">3.</span>
                  <span>View results and analyze student performance by topic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">4.</span>
                  <span>Use insights to adjust your teaching strategy</span>
                </li>
              </ol>
            </div>
          </div>

          {/* View Results Button */}
          <button
            onClick={() => router.push(`/results?formId=${formSlug}`)}
            className="w-full px-6 py-4 bg-gray-900 hover:bg-gray-800
              text-white font-semibold rounded-lg
              transition-all duration-200 shadow-lg hover:shadow-xl
              flex items-center justify-center gap-3"
            aria-label="View results"
          >
            <BarChart3 className="w-5 h-5" />
            View Results
          </button>
        </div>
      </main>
    </div>
  )
}

export default function PublishPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PublishPageContent />
    </Suspense>
  )
}
