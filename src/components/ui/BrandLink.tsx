'use client'

import Link from 'next/link'
import Image from 'next/image'

interface BrandLinkProps {
  href?: string
  className?: string
}

export default function BrandLink({ href = '/upload', className = '' }: BrandLinkProps) {
  return (
    <Link href={href} className={`flex items-center ${className}`}>
      <Image src="/logo.png" alt="reTeach" width={40} height={40} className="rounded-md h-10 w-10" />
      <span className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">reTeach</span>
    </Link>
  )
}

