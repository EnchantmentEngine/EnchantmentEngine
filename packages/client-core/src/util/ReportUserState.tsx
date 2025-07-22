import { defineState, getMutableState, PeerID } from '@ir-engine/hyperflux'

export const ReportUserState = defineState({
  name: 'ReportUserState',
  initial: () => ({
    reportedPeerId: undefined as PeerID | undefined
  }),
  setReportedPeerId: (peerId: PeerID) => {
    getMutableState(ReportUserState).reportedPeerId.set(peerId)
  },
  resetPeerId: () => {
    getMutableState(ReportUserState).reportedPeerId.set(undefined)
  }
})
