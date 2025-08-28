import { API, useFind, useMutation } from '@ir-engine/common'
import {
  AbuseReasonsType,
  moderationBanPath,
  ModerationBanType,
  UserType
} from '@ir-engine/common/src/schema.type.module'
import { Button } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaPlus } from 'react-icons/fa'
import { LuUserMinus } from 'react-icons/lu'
import { ModalState } from '../../../common/services/ModalState'
import { NotificationService } from '../../../common/services/NotificationService'
import { BanUsersModal } from './BanUsersModal'
import ModerationBanTable from './ModerationBanTable'

export const ModerationBanContainer = ({ search }) => {
  const { t } = useTranslation()
  const moderationBanMutation = useMutation(moderationBanPath)

  const moderationBanQuery = useFind(moderationBanPath, {
    query: {
      action: 'admin',
      $limit: 20
    }
  })

  const handleBanUser = async (formData) => {
    const banUser = {
      banUserId: (formData?.selectedUser as UserType).id,
      banned: true,
      banReason: formData?.reason as AbuseReasonsType
    } as ModerationBanType

    try {
      const response = await API.instance.service(moderationBanPath).find({
        query: {
          action: 'admin',
          banUserId: banUser.banUserId,
          $limit: 1
        }
      })

      if (response.data.length > 0) {
        NotificationService.dispatchNotify(t('admin:components.moderation.userAlreadyBanned'), { variant: 'error' })
        return
      }

      await moderationBanMutation.create(banUser)
      NotificationService.dispatchNotify(
        banUser.banned ? t('admin:components.moderation.userBanned') : t('admin:components.moderation.userUnBanned'),
        {
          variant: 'success'
        }
      )
    } catch (error) {
      NotificationService.dispatchNotify(error.message, { variant: 'error' })
      console.error(error)
    }

    ModalState.closeModal()
  }

  return (
    <>
      {moderationBanQuery.status == 'success' && moderationBanQuery.data.length == 0 && search == '' ? (
        <div className="flex w-full items-center justify-center text-white">
          <div className="mt-[241px] text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-800">
              <LuUserMinus className="h-12 w-12 text-gray-400" />
            </div>
            <Text className="mb-2 text-2xl font-bold">{t('admin:components.moderation.addUsersToBan')}</Text>
            <p className="mb-6 text-gray-400">{t('admin:components.moderation.manageAccess')}</p>
            <Button
              variant="primary"
              onClick={() => ModalState.openModal(<BanUsersModal onSubmit={handleBanUser} />)}
              className="mx-auto flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              {t('admin:components.moderation.addUsers')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-full w-full p-4">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="primary"
              onClick={() => ModalState.openModal(<BanUsersModal onSubmit={handleBanUser} />)}
              className="flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              {t('admin:components.moderation.addUsers')}
            </Button>
          </div>
          <ModerationBanTable search={search} />
        </div>
      )}
    </>
  )
}
