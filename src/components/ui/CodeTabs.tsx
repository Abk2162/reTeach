'use client'
import { useState } from 'react'
import CopyButton from './CopyButton'

export default function CodeTabs({ tabs }:{
  tabs: { key:string; label:string; code:string; language?:string }[]
}) {
  const [cur, setCur] = useState(tabs[0]?.key)
  const active = tabs.find(t => t.key===cur) || tabs[0]
  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center gap-2 px-3 pt-3">
        <div className="flex gap-2">
          {tabs.map(t => (
            <button key={t.key}
              onClick={()=>setCur(t.key)}
              className={`px-2 py-1 text-sm rounded-md ${cur===t.key?'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200':'text-gray-600 dark:text-gray-300'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <CopyButton text={active.code} label="Copy snippet"/>
        </div>
      </div>
      <pre className="mt-2 px-3 pb-3 overflow-x-auto text-xs leading-relaxed">
{active.code}
      </pre>
    </div>
  )
}
