import { Paginated } from '@feathersjs/feathers'
import {
  AbuseReasonsType,
  LocationID,
  locationPath,
  LocationType,
  moderationBanPath,
  UserID,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'

import { API } from '@ir-engine/common'
import { useEffect } from 'react'
import { NotificationService } from '../../common/services/NotificationService'
import { AuthState } from '../../user/services/AuthService'

export const LocationSeed: LocationType = {
  id: '' as LocationID,
  name: '',
  slugifiedName: '',
  maxUsersPerInstance: 5,
  sceneId: '',
  projectId: '',
  url: '',
  sceneURL: '',
  isLobby: false,
  isFeatured: false,
  locationSetting: {
    id: '',
    locationId: '' as LocationID,
    audioEnabled: false,
    screenSharingEnabled: false,
    faceStreamingEnabled: false,
    /** @todo: Re-enable this when the engine has a working jump control/vr capabilities */
    // jumpControlEnabled: false,
    // vrEnabled: false,
    locationType: 'private',
    videoEnabled: false,
    createdAt: '',
    updatedAt: ''
  },
  locationAuthorizedUsers: [],
  updatedBy: '' as UserID,
  createdAt: '',
  updatedAt: ''
}

export const LocationState = defineState({
  name: 'LocationState',
  initial: () => ({
    locationName: null! as string,
    currentLocation: {
      location: LocationSeed as LocationType,
      selfUserBanned: false,
      selfNotAuthorized: false
    },
    invalidLocation: false
  }),

  setLocationName: (locationName: string) => {
    getMutableState(LocationState).merge({ locationName })
  },

  fetchingCurrentSocialLocation: () => {
    getMutableState(LocationState).merge({
      currentLocation: {
        location: LocationSeed as LocationType,
        selfUserBanned: false,
        selfNotAuthorized: false
      }
    })
  },

  socialLocationRetrieved: (location: LocationType) => {
    getMutableState(LocationState).merge({
      currentLocation: {
        location: {
          ...location
        },
        selfUserBanned: false,
        selfNotAuthorized: false
      }
    })
  },

  socialLocationNotFound: () => {
    getMutableState(LocationState).merge({
      currentLocation: {
        location: LocationSeed,
        selfUserBanned: false,
        selfNotAuthorized: false
      },
      invalidLocation: true
    })
  },

  socialSelfUserBanned: (banned: boolean) => {
    getMutableState(LocationState).currentLocation.merge({ selfUserBanned: banned })
  },

  socialLocationNotAuthorized: () => {
    getMutableState(LocationState).currentLocation.merge({ selfNotAuthorized: true })
  }
})

export const LocationService = {
  getLocation: async (locationId: LocationID) => {
    try {
      LocationState.fetchingCurrentSocialLocation()
      const location = await API.instance.service(locationPath).get(locationId)
      LocationState.socialLocationRetrieved(location)
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  getLocationByName: async (locationName: string) => {
    LocationState.fetchingCurrentSocialLocation()
    try {
      const locationResult = (await API.instance.service(locationPath).find({
        query: {
          action: 'viewer',
          slugifiedName: locationName
        }
      })) as Paginated<LocationType>

      if (locationResult && locationResult.total > 0) {
        // if (
        //   locationResult.data[0].locationSetting?.locationType === 'private' &&
        //   !locationResult.data[0].locationAuthorizedUsers?.find(
        //     (authUser) => authUser.userId === Engine.instance.userID
        //   )
        // ) {
        //   LocationState.socialLocationNotAuthorized()
        // } else
        LocationState.socialLocationRetrieved(locationResult.data[0])
      } else {
        LocationState.socialLocationNotFound()
      }
    } catch (err) {
      if (err.message.includes('Unable to find projectId'))
        NotificationService.dispatchNotify('You do not have access to this location.', {
          variant: 'error',
          persist: true
        })
    }
  },
  banUserFromLocation: async (userId: UserID, locationId: LocationID, banReason?: AbuseReasonsType) => {
    try {
      await API.instance.service(moderationBanPath).create({
        banUserId: userId,
        banned: true,
        banReason: banReason ?? 'somethingElse',
        reportedLocationId: locationId
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  useLocationBanListeners: () => {
    useEffect(() => {
      const locationBanCreatedListener = async (params) => {
        const selfUser = getState(AuthState).user
        const currentLocation = getState(LocationState).currentLocation.location
        const locationBan = params.locationBan
        if (selfUser.id === locationBan.userId && currentLocation.id === locationBan.locationId) {
          const userId = selfUser.id ?? ''
          const user = await API.instance.service(userPath).get(userId)
          getMutableState(AuthState).merge({ user })
        }
      }
      API.instance.service(moderationBanPath).on('created', locationBanCreatedListener)
      return () => {
        API.instance.service(moderationBanPath).off('created', locationBanCreatedListener)
      }
    }, [])
  }
}
