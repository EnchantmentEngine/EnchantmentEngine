import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineXCircle } from 'react-icons/hi2'

import Button from '../Button'
import Text from '../Text'

interface ErrorViewProps {
  title: string
  description?: string
  retryButtonText?: string
  onRetry?: () => void
}

export default function ErrorView({ title, description, retryButtonText, onRetry }: ErrorViewProps) {
  const { t } = useTranslation()
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-1">
      <HiOutlineXCircle className="h-8 w-8 text-red-500" />
      <Text>{title}</Text>
      {description && (
        <Text fontSize="sm" theme="secondary">
          {description}
        </Text>
      )}
      {onRetry && (
        <Button variant="red" size="sm" className="border border-red-500 bg-transparent text-red-500" onClick={onRetry}>
          {retryButtonText ? retryButtonText : t('common:components.retry')}
        </Button>
      )}
    </div>
  )
}
