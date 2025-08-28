// import * as chapiWalletPolyfill from 'credential-handler-polyfill'
import { SnackbarProvider } from 'notistack'
import React, { useEffect, useRef, useState } from 'react'

// import { useTranslation } from 'react-i18next'

// import { useLocation, useNavigate } from 'react-router-dom'

import { NotificationState } from '@ir-engine/client-core/src/common/services/NotificationService'
import { ProjectService, ProjectState } from '@ir-engine/client-core/src/common/services/ProjectService'
import { LocationState } from '@ir-engine/client-core/src/social/services/LocationService'
import { AuthService, AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { getMutableState, NetworkState, useMutableState } from '@ir-engine/hyperflux'
import { loadEngineInjection } from '@ir-engine/projects/loadEngineInjection'

import Component from './index'

import '@ir-engine/client/src/themes/base.css'
import '@ir-engine/client/src/themes/components.css'
import '@ir-engine/client/src/themes/utilities.css'
import { EngineState } from '@ir-engine/ecs'
import 'tailwindcss/tailwind.css'

// import { useLocation } from 'react-router-dom'

const argTypes = {}
const decorators = [
  (Story) => {
    const notistackRef = useRef<SnackbarProvider>()
    const authState = useMutableState(AuthState)
    const selfUser = authState.user

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [projectComponents, setProjectComponents] = useState<Array<any>>([])
    const [fetchedProjectComponents, setFetchedProjectComponents] = useState(false)
    const projectState = useMutableState(ProjectState)

    const notificationstate = useMutableState(NotificationState)

    useEffect(() => {
      notificationstate.snackbar.set(notistackRef.current)
    }, [notistackRef.current])

    useEffect(() => {
      if (selfUser?.id.value && projectState.updateNeeded.value) {
        ProjectService.fetchProjects()
        if (!fetchedProjectComponents) {
          setFetchedProjectComponents(true)
          loadEngineInjection([]).then((result) => {
            LocationState.setLocationName(locationName)
            setProjectComponents(result)
          })
        }
      }
    }, [selfUser, projectState.updateNeeded.value])

    useEffect(() => {
      getMutableState(EngineState).userID.set(selfUser.id.value)
    }, [selfUser.id])

    useEffect(() => {
      // Oauth callbacks may be running when a guest identity-provider has been deleted.
      // This would normally cause doLoginAuto to make a guest user, which we do not want.
      // Instead, just skip it on oauth callbacks, and the callback handler will log them in.
      // The client and auth settigns will not be needed on these routes
      if (!location.pathname.startsWith('/auth')) {
        AuthService.doLoginAuto()
      }

      getMutableState(NetworkState).config.set({
        world: true,
        media: true,
        friends: false,
        instanceID: true,
        roomID: false
      })
    }, [])

    AuthService.useAPIListeners()

    const locationName = 'default'

    // const engineState = useMutableState(EngineState)

    return (
      <div className="container mx-auto h-full w-full">
        <Story />
        {projectComponents}
      </div>
    )
  }
]
export default {
  title: 'Pages/Capture',
  component: Component,
  decorators,
  parameters: {
    chromatic: { disable: true },
    reactRouter: {
      routePath: '/capture/:locationName',
      routeParams: { locationName: 'default' }
    },
    componentSubtitle: 'Capture',
    jest: 'Capture.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = { args: Component.defaultProps }
