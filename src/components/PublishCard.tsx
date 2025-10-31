'use client'

import { useState } from 'react'
import { Copy, CheckCircle, ExternalLink } from 'lucide-react'

interface PublishCardProps {
  formUrl: string
}

export default function PublishCard({ formUrl }: PublishCardProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
          Form URL
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 font-mono truncate">
          {formUrl}
        </p>
        {copied && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Copied to clipboard
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => copyToClipboard(formUrl)}
          className="p-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
          aria-label="Copy form URL"
          title="Copy link"
        >
          {copied ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
        <a
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
          aria-label="Open form in new tab"
          title="Open in new tab"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </div>
  )
}
