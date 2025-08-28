import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiCheck, HiDocument } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { NO_PROXY, useHookstate } from '@ir-engine/hyperflux'

import Button from '../Button'

export interface CopyTextProps extends React.HTMLAttributes<HTMLTextAreaElement> {
  text: string
  className?: string
  size?: 'xs' | 'sm' | 'l' | 'xl'
}

const CopyText = ({ text, className, size = 'sm' }: CopyTextProps) => {
  const { t } = useTranslation()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const buttonIcon = useHookstate(<HiDocument />)

  const copyText = () => {
    navigator.clipboard.writeText(text)
    NotificationService.dispatchNotify('Text Copied', {
      variant: 'success'
    })
    buttonIcon.set(<HiCheck />)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      buttonIcon.set(<HiDocument />)
    }, 2000)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <Button
      title={t('common:components.copyText')}
      variant="tertiary"
      size={size}
      onClick={copyText}
      className={twMerge('p-1.5 [&>*]:m-0', className)}
    >
      {buttonIcon.get(NO_PROXY)}
    </Button>
  )
}

export default CopyText
