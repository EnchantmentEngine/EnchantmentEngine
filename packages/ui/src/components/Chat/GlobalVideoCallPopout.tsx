/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import { useMediaNetwork } from '@ir-engine/client-core/src/common/services/MediaInstanceConnectionService'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import { MediaSessionState } from '@ir-engine/ui/src/pages/Chat/MediaSessionState'
import React, { useEffect } from 'react'
import { PopoutVideoCall } from './PopoutVideoCall'

/**
 * GlobalVideoCallPopout is a component that renders the PopoutVideoCall
 * when needed, regardless of the current page or route.
 * This ensures the video call stays visible when navigating around the app.
 */
export const GlobalVideoCallPopout: React.FC = () => {
  const mediaSessionState = useHookstate(getMutableState(MediaSessionState))
  const mediaNetworkState = useMediaNetwork()
  const mediaNetworkID = NetworkState.mediaNetwork?.id
  const mediaConnected = mediaNetworkID && mediaNetworkState?.ready.value

  // Check if we should show the popout
  const showPopout = mediaSessionState.isPopout.value && mediaConnected

  // Listen for page navigation events to ensure the popout stays visible
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // If we're in a call with popout mode, warn the user before closing the tab
      if (showPopout) {
        e.preventDefault()
        e.returnValue = 'You are currently in a call. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [showPopout])

  if (!showPopout) return null

  return <PopoutVideoCall />
}

export default GlobalVideoCallPopout
