import React from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import {
  defineState,
  getMutableState,
  HyperFlux,
  NetworkState,
  NO_PROXY,
  NO_PROXY_STEALTH,
  StateDefinitions,
  syncStateWithLocalStorage,
  useHookstate
} from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { useFrameUpdate } from './useFrameUpdate'

const labelRenderer = (data: Record<string | number, any>) => {
  return (keyPath: (string | number)[], ...args) => {
    const key = keyPath[0]
    if (keyPath.length === 2 && typeof key === 'number') {
      return <Text fontWeight="medium">{Array.isArray(data[key].type) ? data[key].type[0] : data[key].type}</Text>
    }
    if (keyPath.length === 4 && typeof key === 'number') {
      const actions = data
      return (
        <Text fontWeight="medium">{Array.isArray(actions[key].type) ? actions[key].type[0] : actions[key].type}</Text>
      )
    }
    return <Text fontWeight="medium">{key}</Text>
  }
}

const actionLabelRenderer = (data: Record<string | number, any>) => {
  return (keyPath: (string | number)[], ...args) => {
    const key = keyPath[0]
    // action
    if (keyPath.length === 2 && typeof key === 'number') {
      const actions = data
      return (
        <Text fontWeight="medium">{Array.isArray(actions[key].type) ? actions[key].type[0] : actions[key].type}</Text>
      )
    }
    //$stack
    if (keyPath.length === 4) {
      return ''
    }
    return <Text fontWeight="medium">{key}</Text>
  }
}

const StateSearchState = defineState({
  name: 'StateSearchState',
  initial: {
    search: ''
  },
  extension: syncStateWithLocalStorage(['search'])
})

export function StateDebug() {
  const { t } = useTranslation()

  useFrameUpdate()

  const stateSearch = useHookstate(getMutableState(StateSearchState).search)

  const state =
    stateSearch.value === ''
      ? HyperFlux.store.stateMap
      : Object.fromEntries(
          Object.entries(HyperFlux.store.stateMap)
            .filter(([key]) => key.toLowerCase().includes(stateSearch.value.toLowerCase()))
            .map(([key, value]) => [key, value.get(NO_PROXY_STEALTH)])
        )

  const actionHistory = [...HyperFlux.store.actions.history].sort((a, b) => a.$time - b.$time)
  const eventSourcedHistory = Object.fromEntries(
    [...StateDefinitions.entries()]
      .filter(([name, state]) => state.receptorActionQueue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [key, value.receptorActionQueue!.instance])
  )
  const networks = useHookstate(getMutableState(NetworkState).networks).get(NO_PROXY)

  return (
    <div className="m-1 bg-neutral-600 p-1">
      <div className="my-0.5">
        <Text className="text-text-primary-button">{t('common:debug.state')}</Text>
        <Input
          type="text"
          placeholder="Search..."
          value={stateSearch.value}
          onChange={(event) => stateSearch.set(event.target.value)}
        />
        <JSONTree data={state} />
      </div>
      <div className="my-0.5">
        <h1>{t('common:debug.eventSourcedState')}</h1>
        <JSONTree
          data={eventSourcedHistory}
          labelRenderer={labelRenderer(eventSourcedHistory)}
          shouldExpandNodeInitially={() => false}
        />
      </div>
      <div className="my-0.5">
        <h1>{t('common:debug.networks')}</h1>
        <JSONTree data={networks} shouldExpandNodeInitially={() => false} />
      </div>
      <div className="my-0.5">
        <h1>{t('common:debug.actionsHistory')}</h1>
        <JSONTree
          data={actionHistory}
          labelRenderer={actionLabelRenderer(actionHistory)}
          shouldExpandNodeInitially={() => false}
        />
      </div>
    </div>
  )
}
