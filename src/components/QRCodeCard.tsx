'use client'

import { useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface QRCodeCardProps {
  url: string
  title?: string
}

export default function QRCodeCard({ url, title = 'Scan to access form' }: QRCodeCardProps) {
  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="p-4 bg-white rounded-lg">
        <QRCodeSVG
          value={url}
          size={200}
          level="M"
          includeMargin={true}
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        Students can scan this QR code with their phones
      </p>
    </div>
  )
}
