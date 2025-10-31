'use client'

interface SectionHeaderProps {
  title: string
  description?: string
}

export default function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <header className="space-y-2">
      <h2 className="text-sm uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {description && (
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
    </header>
  )
}
