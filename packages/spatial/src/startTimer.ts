import { ECSState, Timer, executeSystems } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { XRState } from './xr/XRState'

export const startTimer = () => {
  const timer = Timer((time, xrFrame) => {
    getState(XRState).xrFrame = xrFrame
    executeSystems(time)
    getState(XRState).xrFrame = null
  })
  getMutableState(ECSState).timer.set(timer)
  timer.start()
}
