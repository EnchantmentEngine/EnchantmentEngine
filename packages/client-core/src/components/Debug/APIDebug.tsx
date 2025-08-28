import React from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { FeathersState } from '@ir-engine/common'
import {
  defineState,
  getMutableState,
  NO_PROXY_STEALTH,
  syncStateWithLocalStorage,
  useHookstate,
  useMutableState
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
      const actions = data[keyPath[2]].actions
      return (
        <Text fontWeight="medium">{Array.isArray(actions[key].type) ? actions[key].type[0] : actions[key].type}</Text>
      )
    }
    return <Text fontWeight="medium">{key}</Text>
  }
}

const APISearchState = defineState({
  name: 'APISearchState',
  initial: {
    search: ''
  },
  extension: syncStateWithLocalStorage(['search'])
})

export function APIDebug() {
  const { t } = useTranslation()

  useFrameUpdate()

  const apiSearch = useHookstate(getMutableState(APISearchState).search)
  const apiSearchLowercase = apiSearch.value.toLowerCase()

  const state = Object.fromEntries(
    Object.entries(useMutableState(FeathersState).get(NO_PROXY_STEALTH))
      .map(([key, value]) => {
        const serviceQueries = Object.fromEntries(
          Object.entries(value)
            .map(([queryHash, query]) => {
              const argsString = JSON.stringify(query.query.args)
              return [
                argsString,
                {
                  query: query.query,
                  response: query.response,
                  status: query.status,
                  error: query.error,
                  time: query.resolvedTime ? `${query.resolvedTime - query.requestTime}ms` : null,
                  stack: query.$stack
                }
              ] as const
            })
            .filter(([args]) => args.toLowerCase().includes(apiSearchLowercase))
        )
        return [key, serviceQueries]
      })
      .filter(([key, serviceQueries]) => Object.keys(serviceQueries).length > 0)
  )

  return (
    <div className="m-1 bg-neutral-600 p-1">
      <div className="my-0.5">
        <Text className="text-text-primary-button">{t('common:debug.api')}</Text>
        <Input
          type="text"
          placeholder="Search..."
          value={apiSearch.value}
          onChange={(event) => apiSearch.set(event.target.value)}
        />
        <JSONTree data={state} />
      </div>
    </div>
  )
}
