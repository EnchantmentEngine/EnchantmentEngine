import { ABUSE_REASONS } from '@ir-engine/common/src/constants/ModerationConstants'
import { UserType } from '@ir-engine/common/src/schema.type.module'
import { Select } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalState } from '../../../common/services/ModalState'
import { UserSearchInput } from './common/UserSearchInput'

export const BanUsersModal = ({ onSubmit }) => {
  const { t } = useTranslation()
  const [selectedUser, setSelectedUser] = useState<UserType | undefined>(undefined)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!selectedUser) {
      setError(t('admin:components.moderation.bannedSelectUserError'))
      return
    }
    if (!reason) {
      setError(t('admin:components.moderation.bannedUserReasonError'))
      return
    }
    onSubmit({
      selectedUser,
      reason
    })
    setReason('')
    setError(null)
  }

  const isFormValid = selectedUser && reason

  return (
    <Modal
      title={t('admin:components.moderation.addUser')}
      className="w-[50vw] max-w-2xl"
      onClose={ModalState.closeModal}
      closeButtonText={t('common:components.cancel')}
      submitButtonText={t('admin:components.moderation.banUser')}
      onSubmit={handleSubmit}
      submitButtonDisabled={!isFormValid}
    >
      <div className="space-y-4">
        {error && <div className="text-red-500">{error}</div>}
        <UserSearchInput onSelect={setSelectedUser} />
        <div>
          <label className="mb-1 block text-sm text-gray-400">{t('admin:components.moderation.userId')}</label>
          <input
            type="text"
            disabled={!!selectedUser}
            className="w-full rounded-lg bg-[#191b1f] px-3 py-2 text-white focus:outline-none focus:ring focus:ring-blue-500"
            placeholder={t('admin:components.moderation.uidPlaceholder')}
            value={selectedUser ? selectedUser?.id : ''}
          />
        </div>
        <div>
          <Select
            labelProps={{ text: t('admin:components.moderation.reason'), position: 'top' }}
            options={[...ABUSE_REASONS].map((abuseReason) => ({
              label: t(`user:moderation.abuseReason.${abuseReason}`) as string,
              value: abuseReason
            }))}
            onChange={(e) => setReason(e as string)}
            width="full"
            helperText={t('admin:components.moderation.userBannedSelectReasonHelperText')}
            value={reason}
          />
        </div>
      </div>
    </Modal>
  )
}
