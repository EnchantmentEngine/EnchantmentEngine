import React from 'react'
import { useTranslation } from 'react-i18next'
import { PiWarning } from 'react-icons/pi'

import Text from '../Text'

interface WarningViewProps {
  title: string
  description?: string
  retryButtonText?: string
  onRetry?: () => void
}

export default function WarningView({ title, description }: WarningViewProps) {
  const { t } = useTranslation()
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-1 bg-yellow-600">
      <PiWarning className="h-8 w-8 text-white" />
      <Text>{title}</Text>
      {description && (
        <Text fontSize="sm" theme="secondary">
          {description}
        </Text>
      )}
    </div>
  )
}
