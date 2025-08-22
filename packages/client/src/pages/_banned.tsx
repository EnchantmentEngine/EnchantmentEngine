import { useThemeProvider } from '@ir-engine/client-core/src/common/services/ThemeService'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdWarning } from 'react-icons/md'
import '../styles.scss'

export default function UserBanned() {
  const { t } = useTranslation()

  useThemeProvider()

  return (
    <Modal
      id="user-banned-modal"
      className="pointer-events-auto fixed inset-0 z-[10000] m-auto flex h-[250px] w-[600px] rounded-xl bg-surface-1 [&>div]:flex [&>div]:w-full [&>div]:flex-col"
      hideFooter={true}
      rawChildren={
        <div className="flex w-full flex-col items-center gap-6 p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white">
            <MdWarning />
          </div>
          <span className="text-center text-text-secondary">{t('user:common.userBannedMessage') as string}</span>
          <span className="text-center text-text-secondary">
            {t('user:common.userBannedMessageDescription') as string}
          </span>
        </div>
      }
    />
  )
}
