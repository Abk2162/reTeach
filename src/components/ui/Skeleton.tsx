export function Skeleton({ className='' }:{ className?:string }) {
  return <div className={`shimmer bg-gray-200/60 dark:bg-white/10 rounded ${className}`} />
}
