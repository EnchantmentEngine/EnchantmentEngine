import { Button } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { GoAlert } from 'react-icons/go'
import { ModalState } from '../../../common/services/ModalState'

interface Props {
  handleConfirm: () => void
  handleCancel?: () => void
}

export const DiscardAvatarChangesMenu = ({ handleConfirm, handleCancel }: Props) => {
  const { t } = useTranslation()

  const handleClose = () => {
    ModalState.closeModal()
    if (handleCancel) handleCancel()
  }

  return (
    <Modal
      className="max-h-1/3 pointer-events-auto h-fit max-h-[90dvh] w-1/4 rounded-lg md:h-72 md:w-96"
      hideFooter
      rawChildren={
        <div className="grid h-full grid-flow-row grid-rows-[auto,1fr,auto] p-6">
          <div className="flex h-14 w-14 justify-self-center rounded-full bg-surface-4">
            <GoAlert className="m-auto text-3xl text-ui-hover-error" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <Text fontSize="xl" fontWeight="medium" className="capitalize text-text-primary">
              {t('user:avatar.discardAvatarChanges')}
            </Text>
            <Text fontSize="base" className="mt-2 text-text-secondary">
              {t('user:common.changesLostAlert')}
            </Text>
          </div>

          <div className="flex justify-center gap-6">
            <Button className="rounded-md" fullWidth onClick={handleClose}>
              {t('common:components.back')}
            </Button>
            <Button className="rounded-md" fullWidth onClick={handleConfirm}>
              {t('user:common.discard')}
            </Button>
          </div>
        </div>
      }
    />
  )
}
