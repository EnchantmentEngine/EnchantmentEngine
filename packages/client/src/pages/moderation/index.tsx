import { useHookstate } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const Moderation = () => {
  const { t } = useTranslation()
  const searchQuery = useHookstate('')
  return <div>test</div>
}
