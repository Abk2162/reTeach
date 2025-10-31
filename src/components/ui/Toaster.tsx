'use client'
import { createContext, useContext, useState, useCallback, useRef } from 'react'

type Toast = { id: string; title?: string; desc?: string; type?: 'success'|'error'|'info' }

const Ctx = createContext<{ push:(t:Omit<Toast,'id'>)=>void } | null>(null)

export function ToasterProvider({ children }:{ children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const idCounter = useRef(0)
  
  const push = useCallback((t: Omit<Toast,'id'>) => {
    const id = `toast-${++idCounter.current}`
    setItems(s => [...s, { id, ...t }])
    setTimeout(() => setItems(s => s.filter(i => i.id !== id)), 4000)
  }, [])
  
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed z-[60] top-4 left-1/2 transform -translate-x-1/2 space-y-3">
        {items.map(i => (
          <div key={i.id}
               className={`transform transition-all duration-300 ease-out bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl px-4 py-3 min-w-[280px] shadow-xl border ${
                 i.type==='success'?'border-green-200/50 shadow-green-100/20':
                 i.type==='error'?'border-red-200/50 shadow-red-100/20':
                 'border-indigo-200/50 shadow-indigo-100/20'
               }`}>
            {i.title && (
              <div className={`font-semibold text-sm ${
                i.type==='success'?'text-green-800 dark:text-green-200':
                i.type==='error'?'text-red-800 dark:text-red-200':
                'text-gray-800 dark:text-gray-200'
              }`}>
                {i.title}
              </div>
            )}
            {i.desc && (
              <div className={`text-sm mt-1 ${
                i.type==='success'?'text-green-700 dark:text-green-300':
                i.type==='error'?'text-red-700 dark:text-red-300':
                'text-gray-600 dark:text-gray-400'
              }`}>
                {i.desc}
              </div>
            )}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast(){
  const c=useContext(Ctx)
  if(!c) throw new Error('useToast in provider')
  return c.push
}
