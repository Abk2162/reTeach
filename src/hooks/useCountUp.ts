'use client'
import { useEffect, useRef, useState } from 'react'
export default function useCountUp(target:number, ms=800) {
  const [val, setVal] = useState(0)
  const t0 = useRef<number>()
  useEffect(() => {
    let raf:number
    const step = (now:number) => {
      if (!t0.current) t0.current = now
      const p = Math.min(1, (now - t0.current)/ms)
      setVal(Math.round(target * (0.5 - Math.cos(Math.PI*p)/2))) // easeInOut
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return val
}
