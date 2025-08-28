import { Paginated } from '@feathersjs/feathers'
import i18n from 'i18next'
import { useEffect } from 'react'

import { API } from '@ir-engine/common'
import multiLogger from '@ir-engine/common/src/logger'
import { UserID, UserName, userRelationshipPath, UserRelationshipType } from '@ir-engine/common/src/schema.type.module'
import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { AuthState } from '../../user/services/AuthService'

const logger = multiLogger.child({ component: 'client-core:FriendService' })

//State
export const FriendState = defineState({
  name: 'FriendState',
  initial: () => ({
    relationships: [] as UserRelationshipType[],
    isFetching: false,
    updateNeeded: true
  })
})

//Service
export const FriendService = {
  getUserRelationship: async (userId: UserID) => {
    try {
      getMutableState(FriendState).isFetching.set(true)

      const relationships = (await API.instance.service(userRelationshipPath).find({
        query: {
          $or: [
            {
              userId
            },
            {
              relatedUserId: userId,
              userRelationshipType: 'requested'
            }
          ],
          $limit: 100
        }
      })) as Paginated<UserRelationshipType>

      getMutableState(FriendState).merge({ relationships: relationships.data, isFetching: false, updateNeeded: false })
    } catch (err) {
      logger.error(err)
    }
  },
  requestFriend: (userId: UserID, relatedUserId: UserID) => {
    return createRelation(userId, relatedUserId, 'requested')
  },
  acceptFriend: async (userId: UserID, relatedUserId: UserID) => {
    try {
      await API.instance.service(userRelationshipPath).patch(relatedUserId, {
        userRelationshipType: 'friend'
      })

      FriendService.getUserRelationship(userId)
    } catch (err) {
      logger.error(err)
    }
  },
  declineFriend: (userId: UserID, relatedUserId: UserID) => {
    return removeRelation(userId, relatedUserId)
  },
  unfriend: (userId: UserID, relatedUserId: UserID) => {
    return removeRelation(userId, relatedUserId)
  },
  blockUser: async (userId: UserID, relatedUserId: UserID) => {
    return createRelation(userId, relatedUserId, 'blocking')
  },
  unblockUser: (userId: UserID, relatedUserId: UserID) => {
    return removeRelation(userId, relatedUserId)
  },
  useAPIListeners: () => {
    useEffect(() => {
      const userRelationshipCreatedListener = (params) => {
        const selfUser = getState(AuthState).user
        if (params.userRelationshipType === 'requested' && selfUser.id === params.relatedUserId)
          NotificationService.dispatchNotify(
            `${params.user.name as UserName} ${i18n.t('user:friends.requestReceived')}`,
            {
              variant: 'success'
            }
          )

        FriendService.getUserRelationship(selfUser.id)
      }
      const userRelationshipPatchedListener = (params) => {
        const selfUser = getState(AuthState).user

        if (params.userRelationshipType === 'friend' && selfUser.id === params.relatedUserId) {
          NotificationService.dispatchNotify(
            `${params.user.name as UserName} ${i18n.t('user:friends.requestAccepted')}`,
            {
              variant: 'success'
            }
          )
        }

        FriendService.getUserRelationship(selfUser.id)
      }
      const userRelationshipRemovedListener = () => {
        const selfUser = getState(AuthState).user
        FriendService.getUserRelationship(selfUser.id)
      }

      API.instance.service(userRelationshipPath).on('created', userRelationshipCreatedListener)
      API.instance.service(userRelationshipPath).on('patched', userRelationshipPatchedListener)
      API.instance.service(userRelationshipPath).on('removed', userRelationshipRemovedListener)

      return () => {
        API.instance.service(userRelationshipPath).off('created', userRelationshipCreatedListener)
        API.instance.service(userRelationshipPath).off('patched', userRelationshipPatchedListener)
        API.instance.service(userRelationshipPath).off('removed', userRelationshipRemovedListener)
      }
    }, [])
  }
}

async function createRelation(userId: UserID, relatedUserId: UserID, type: 'requested' | 'blocking') {
  console.log('createRelation', { userId, relatedUserId, type })
  try {
    await API.instance.service(userRelationshipPath).create({
      relatedUserId,
      userRelationshipType: type,
      userId: '' as UserID
    })

    FriendService.getUserRelationship(userId)
  } catch (err) {
    logger.error(err)
  }
}

async function removeRelation(userId: UserID, relatedUserId: UserID) {
  try {
    await API.instance.service(userRelationshipPath).remove(relatedUserId)

    FriendService.getUserRelationship(userId)
  } catch (err) {
    logger.error(err)
  }
}
