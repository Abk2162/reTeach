'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, X } from 'lucide-react'

interface FileDropProps {
  onText: (text: string, pages?: string[]) => void
}

export default function FileDrop({ onText }: FileDropProps) {
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const extractText = async (file: File): Promise<{ fullText: string; pages: string[] }> => {
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'txt') {
      const text = await file.text()
      return { fullText: text, pages: [text] }
    }

    if (ext === 'pdf') {
      try {
        // Dynamically import pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist')

        // Use unpkg CDN as fallback - works everywhere
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

        // Convert file to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()

        // Load PDF
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

        // Extract text from all pages
        let fullText = ''
        const pages: string[] = []

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()

          // Reconstruct text with proper line breaks based on Y positions
          let lastY = -1
          let pageText = ''

          textContent.items.forEach((item: any) => {
            const currentY = item.transform[5]

            // If Y position changed significantly, add a line break
            if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
              pageText += '\n'
            }

            // Add space if not at start of line
            if (item.str && pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
              pageText += ' '
            }

            pageText += item.str
            lastY = currentY
          })

          pages.push(pageText.trim())
          fullText += pageText.trim() + '\n\n'
        }

        return { fullText, pages }
      } catch (err) {
        console.error('PDF extraction error:', err)
        throw new Error('Failed to extract text from PDF. Please try a .txt file or paste the text manually.')
      }
    }

    throw new Error('Unsupported file type. Please use .txt or .pdf files.')
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      try {
        const { fullText, pages } = await extractText(files[0])
        setFileName(files[0].name)
        onText(fullText, pages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process file')
      }
    }
  }, [onText])

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setError(null)

    const files = e.target.files
    if (files && files[0]) {
      try {
        const { fullText, pages } = await extractText(files[0])
        setFileName(files[0].name)
        onText(fullText, pages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process file')
      }
    }
  }, [onText])

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFileName(null)
    setError(null)
  }

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-8
          transition-all duration-200 cursor-pointer
          ${dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          }
        `}
      >
        <input
          type="file"
          id="file-upload"
          accept=".txt,.pdf"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload syllabus file"
        />

        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {fileName ? (
            <>
              <FileText className="w-12 h-12 text-green-600 pointer-events-none" />
              <div className="pointer-events-none">
                <p className="font-semibold text-gray-900 dark:text-white">{fileName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  File uploaded successfully
                </p>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="mt-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 z-10"
                aria-label="Clear uploaded file"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 pointer-events-none" />
              <div className="pointer-events-none">
                <p className="font-semibold text-gray-900 dark:text-white">
                  Drop your syllabus here
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  or click to browse (.txt or .pdf)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
