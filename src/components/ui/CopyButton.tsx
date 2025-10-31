'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useToast } from './Toaster'

export default function CopyButton({ text, label='Copy' }:{ text:string; label?:string }) {
  const [copied, setCopied] = useState(false)
  const push = useToast()
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      push({ type: 'success', title: 'Copied!', desc: label })
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      push({ type: 'error', title: 'Copy failed', desc: 'Please copy manually' })
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all duration-200 ease-out ${
        copied 
          ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
          : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
      }`}
    >
      <div className="relative w-4 h-4">
        <Copy 
          className={`w-4 h-4 transition-all duration-200 ${
            copied ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
          }`} 
        />
        <Check 
          className={`absolute inset-0 w-4 h-4 transition-all duration-200 ${
            copied ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`} 
        />
      </div>
      <span className="transition-all duration-200">
        {copied ? 'Copied!' : label}
      </span>
    </button>
  )
}
