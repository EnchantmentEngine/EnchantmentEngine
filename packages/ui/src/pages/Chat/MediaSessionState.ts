import { defineState, PeerID, syncStateWithLocalStorage } from '@ir-engine/hyperflux'

export const MediaSessionState = defineState({
  name: 'ir.ui.chat.MediaSessionState',
  initial: () => ({
    // Whether the media session is in fullscreen mode
    isFullscreen: false,

    // Whether the media session is in expanded view mode
    isExpanded: false,

    // Whether the media session is in popout mode
    isPopout: false,

    // Position of the popout window
    popoutPosition: { x: 20, y: 20 },

    // Size of the popout window
    popoutSize: { width: 400, height: 300 },

    // Individual volume levels for each peer
    peerVolumes: {} as Record<PeerID, number>,

    // Whether the media session panel is visible
    isVisible: false
  }),
  extension: syncStateWithLocalStorage(['peerVolumes', 'isExpanded', 'isPopout', 'popoutPosition', 'popoutSize'])
})
