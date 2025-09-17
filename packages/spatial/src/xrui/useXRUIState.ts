import { useContext } from 'react'

import { State, useHookstate } from '@ir-engine/hyperflux'

import { XRUIStateContext } from './XRUIStateContext'

//@ts-ignore
export const useXRUIState = <S extends State>() => useHookstate<S>(useContext(XRUIStateContext) as S)
