import { t } from 'i18next'
import { useEffect } from 'react'

import { LocationService, LocationState } from '@ir-engine/client-core/src/social/services/LocationService'
import { useFind } from '@ir-engine/common'
import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { SceneState } from '@ir-engine/engine/src/gltf/GLTFState'
import { getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'

import { ReferenceSpaceState } from '@ir-engine/spatial'
import { NotificationService } from '../../common/services/NotificationService'
import { RouterState } from '../../common/services/RouterService'
import { ClientContextState } from '../../util/ClientContextState'

export const useLoadLocation = (props: { locationName: string }) => {
  const locationState = useMutableState(LocationState)

  ClientContextState.useValue('location_id', locationState.currentLocation.location.id.value)
  ClientContextState.useValue('project_id', locationState.currentLocation.location.projectId.value)

  useEffect(() => {
    LocationState.setLocationName(props.locationName)
    if (locationState.locationName.value) LocationService.getLocationByName(locationState.locationName.value)
  }, [])

  useEffect(() => {
    if (locationState.invalidLocation.value) {
      NotificationService.dispatchNotify(
        `${t('common:instanceServer.cantFindLocation')} '${locationState.locationName.value}'. ${t(
          'common:instanceServer.misspelledOrNotExist'
        )}`,
        { variant: 'error' }
      )
      RouterState.navigate('/')
    }
  }, [locationState.invalidLocation])

  /** @todo disabled */
  // useEffect(() => {
  //   if (locationState.currentLocation.selfNotAuthorized.value) {
  //     WarningUIService.openWarning({
  //       title: t('common:instanceServer.notAuthorizedAtLocationTitle'),
  //       body: t('common:instanceServer.notAuthorizedAtLocation'),
  //       action: () => RouterState.navigate('/')
  //     })
  //   }
  // }, [locationState.currentLocation.selfNotAuthorized])

  /**
   * Once we have the location, fetch the current scene data
   */
  useEffect(() => {
    if (
      !locationState.currentLocation.location.sceneId.value ||
      locationState.invalidLocation.value ||
      locationState.currentLocation.selfNotAuthorized.value ||
      !locationState.currentLocation.location.sceneURL.value
    )
      return
    const sceneURL = locationState.currentLocation.location.sceneURL.value
    const sceneID = locationState.currentLocation.location.sceneId.value
    const viewerEntity = getState(ReferenceSpaceState).viewerEntity
    return SceneState.loadScene(sceneURL, sceneID, viewerEntity)
  }, [locationState.currentLocation.location.sceneId, locationState.currentLocation.location.sceneURL])
}

export const useLoadScene = (props: { projectName: string; sceneName: string }) => {
  const key = `projects/${props.projectName}/${props.sceneName}`
  const resourceQuery = useFind(staticResourcePath, {
    query: {
      key
    }
  })

  useEffect(() => {
    if (!resourceQuery.data.length) return
    const resource = resourceQuery.data[0]
    getMutableState(LocationState).currentLocation.location.sceneId.set(resource.id)
    getMutableState(LocationState).currentLocation.location.sceneURL.set(resource.url)
    const viewerEntity = getState(ReferenceSpaceState).viewerEntity
    const unload = SceneState.loadScene(resource.url, resource.id, viewerEntity)
    return () => {
      getMutableState(LocationState).currentLocation.location.sceneId.set('')
      getMutableState(LocationState).currentLocation.location.sceneURL.set('')
      unload()
    }
  }, [resourceQuery.data])
}
