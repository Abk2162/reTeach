'use client'
import { Check } from 'lucide-react'

export default function Stepper({ steps, current }:{
  steps: { key:string; label:string }[]; current: number
}) {
  const pct = Math.round(((current) / (steps.length)) * 100)
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm mb-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full grid place-content-center text-white text-xs
                             ${i+1<=current?'bg-indigo-600':'bg-gray-300 dark:bg-gray-700'}`}>
              {i+1 < current ? <Check className="w-4 h-4"/> : i+1}
            </div>
            <span className={`${i+1<=current?'text-gray-900 dark:text-white':'text-gray-500'}`}>{s.label}</span>
          </div>
        ))}
      </div>
      <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600" style={{ width: `${pct}%` }}/>
      </div>
    </div>
  )
}
