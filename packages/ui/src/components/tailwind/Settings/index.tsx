import React from 'react'
import { twMerge } from 'tailwind-merge'

import { CaptureClientSettingsState } from '@ir-engine/client-core/src/media/CaptureClientSettingsState'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'

export interface SettingsProps {
  className?: string
}

/**
 * Settings component
 */
const CaptureSettings = ({ className }: SettingsProps) => {
  const captureState = useHookstate(getMutableState(CaptureClientSettingsState).settings)
  const tab = useHookstate(getMutableState(CaptureClientSettingsState).tab)
  return (
    <div className={twMerge('static h-full w-full', className)}>
      <div className={'tabs tabs-boxed w-full'}>
        {captureState?.value.map((state, idx) => {
          return (
            <a
              key={`${state.name}_${idx}`}
              onClick={() => {
                tab.set(idx)
              }}
              className={twMerge('tab w-1/3', tab.value === idx && 'tab-active')}
            >
              {state.name}
            </a>
          )
        })}
      </div>
      <div className="relative h-full w-full">
        {captureState?.value?.map((state, idx) => {
          return (
            <div
              className={twMerge(
                'invisible absolute w-full opacity-0',
                tab.value === idx && 'active visible opacity-100'
              )}
              key={`${state.name}_${idx}_content`}
            >
              <ul className="m-0 w-full list-none p-0">
                {Object.keys(state).map((key, idx) => {
                  if (key === 'name' || key === 'tabOrder') return
                  switch (typeof state[key]) {
                    case 'number':
                      return (
                        <li key={`${key}_${idx}`} className="label cursor-pointer">
                          <span className="label-text">{key}</span>
                          <input
                            onChange={() => {
                              captureState.set((nodes) => {
                                const newState = (nodes || [])
                                  .filter(({ name }) => name !== state.name)
                                  .concat([{ ...state, name: state.name, [key]: !state[key] }])
                                  ?.sort((a, b) => {
                                    if (a.tabOrder < b.tabOrder) return -1
                                    if (a.tabOrder > b.tabOrder) return 1
                                    return 0
                                  })
                                return newState
                              })
                            }}
                            min={0}
                            max={100}
                            type="range"
                            value={Math.floor(state[key] * 100)}
                            className="range range-primary"
                          />
                        </li>
                      )
                    case 'boolean':
                    default:
                      return (
                        <li key={`${key}_${idx}`} className="label cursor-pointer">
                          <span className="label-text">{key}</span>
                          <input
                            onChange={() => {
                              captureState.set((nodes) => {
                                const newState = (nodes || [])
                                  .filter(({ name }) => name !== state.name)
                                  .concat([{ ...state, name: state.name, [key]: !state[key] }])
                                  ?.sort((a, b) => {
                                    if (a.tabOrder < b.tabOrder) return -1
                                    if (a.tabOrder > b.tabOrder) return 1
                                    return 0
                                  })
                                return newState
                              })
                            }}
                            type="checkbox"
                            className="toggle toggle-primary"
                            {...(state[key] === true ? { defaultChecked: true } : {})}
                          />
                        </li>
                      )
                  }
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

CaptureSettings.defaultProps = {
  className: ''
}

export default CaptureSettings
