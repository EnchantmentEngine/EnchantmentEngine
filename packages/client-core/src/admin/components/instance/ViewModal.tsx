import React from 'react'
import { useTranslation } from 'react-i18next'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { useFind, useMutation } from '@ir-engine/common'
import {
  InstanceID,
  UserID,
  instanceAttendancePath,
  userAvatarPath,
  userKickPath,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import { toDateTimeSql, toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { useHookstate } from '@ir-engine/hyperflux'
import { Button } from '@ir-engine/ui'
import AvatarImage from '@ir-engine/ui/src/primitives/tailwind/AvatarImage'
import Badge from '@ir-engine/ui/src/primitives/tailwind/Badge'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { NotificationService } from '../../../common/services/NotificationService'

const useKickUser = () => {
  const createUserKick = useMutation(userKickPath).create

  return (kickData: { userId: UserID; instanceId: InstanceID; duration: string }) => {
    const duration = new Date()
    if (kickData.duration === 'INFINITY') {
      duration.setFullYear(duration.getFullYear() + 10) // ban for 10 years
    } else {
      duration.setHours(duration.getHours() + parseInt(kickData.duration, 10))
    }
    try {
      createUserKick({ ...kickData, duration: toDateTimeSql(duration) })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

const useUnbanUser = () => {
  const removeUserKick = useMutation(userKickPath).remove

  return (kickData: { userId: UserID; instanceId: InstanceID }) => {
    try {
      removeUserKick(null, { query: { userId: kickData.userId, instanceId: kickData.instanceId } })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

const useUsersInInstance = (instanceId: InstanceID) => {
  const instanceAttendances = useFind(instanceAttendancePath, {
    query: {
      instanceId
    }
  })

  const userIds = instanceAttendances.data.map((d: any) => d.userId)
  return useFind(userPath, {
    query: {
      id: {
        $in: userIds
      },
      $sort: {
        createdAt: 1
      },
      $limit: 10
    }
  })
}

// TODO: Needs styles polishing
export default function ViewUsersModal({ instanceId }: { instanceId: string }) {
  const { t } = useTranslation()

  const kickData = useHookstate({
    userId: '' as UserID,
    instanceId: '' as InstanceID,
    duration: '8'
  })

  const instanceUsersQuery = useUsersInInstance(instanceId as InstanceID)

  const userKickQuery = useFind(userKickPath, {
    query: {
      instanceId
    }
  })
  const kickUser = useKickUser()
  const unbanUser = useUnbanUser()

  return (
    <Modal
      title="View"
      className="w-[50vw] max-w-2xl"
      onClose={() => {
        ModalState.closeModal()
      }}
    >
      {instanceUsersQuery.data.length === 0 ? (
        <Text theme="secondary" className="w-full text-center">
          {t('admin:components.instance.noInstanceUsers')}
        </Text>
      ) : null}
      <div className="grid gap-2">
        {instanceUsersQuery.data.map((el) => {
          const avatar = useFind(userAvatarPath, {
            query: {
              userId: el.id
            }
          })
          return (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AvatarImage src={avatar.data[0].avatar.thumbnailResource?.url ?? ''} />
                <Text>{el.name}</Text>
              </div>
              {userKickQuery.data.find((d: any) => d.userId === el.id) ? (
                <div className="flex items-center justify-between gap-10">
                  <Badge
                    className="rounded"
                    variant="danger"
                    label={t('admin:components.instance.banned', {
                      duration: toDisplayDateTime(userKickQuery.data.find((d: any) => d.userId === el.id)!.duration)
                    })}
                  />
                  <Button
                    variant="tertiary"
                    onClick={() => {
                      unbanUser({
                        userId: el.id,
                        instanceId: instanceId as InstanceID
                      })
                    }}
                  >
                    {t('admin:components.instance.unban')}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="tertiary"
                    onClick={() => {
                      kickData.merge({
                        userId: el.id,
                        instanceId: instanceId as InstanceID,
                        duration: '8'
                      })
                      kickUser(kickData.value)
                    }}
                  >
                    {t('admin:components.instance.kick')}
                  </Button>
                  <Button
                    variant="tertiary"
                    onClick={() => {
                      kickData.merge({
                        userId: el.id,
                        instanceId: instanceId as InstanceID,
                        duration: 'INFINITY'
                      })
                      kickUser(kickData.value)
                    }}
                  >
                    {t('admin:components.instance.ban')}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
