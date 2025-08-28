import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useQuery } from '@ir-engine/ecs'

import { HyperFlux, NO_PROXY, useMutableState } from '@ir-engine/hyperflux'
import { RenderInfoState } from '@ir-engine/spatial/src/renderer/RenderInfoSystem'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { LightTagComponent } from '@ir-engine/spatial/src/renderer/components/lights/LightTagComponent'
import { ResourceState } from '@ir-engine/spatial/src/resources/ResourceState'
import { Button, Tooltip } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Stats from './stats'

const downloadStateSnapshot = () => {
  const states = Object.fromEntries(
    Object.entries(HyperFlux.store.stateMap)
      .map(([key, state]) => {
        try {
          const value = state.get(NO_PROXY)
          if (typeof 'value'! === 'object') {
            return [key, JSON.parse(JSON.stringify(value))]
          }
          const obj = {} as typeof value
          for (const [k, v] of Object.entries(value)) {
            try {
              obj[k] = JSON.parse(JSON.stringify(v))
            } catch (e) {
              console.error(`Failed to serialize state ${key} for property: ${k}`, e)
            }
          }
          return [key, obj]
        } catch (e) {
          console.error(`Failed to serialize state: ${key}`, e)
          return [key, undefined]
        }
      })
      .filter(([key, value]) => value !== undefined)
  )
  const stateString = JSON.stringify(states, null, 2)
  const blob = new Blob([stateString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'state.json'
  a.click()
  URL.revokeObjectURL(url)
}

globalThis.__downloadStateSnapshot = downloadStateSnapshot

export const StatsPanel = (props: { show: boolean }) => {
  const renderInfoState = useMutableState(RenderInfoState)
  const info = renderInfoState.visible.value && renderInfoState.info.value
  const lightQuery = useQuery([LightTagComponent, VisibleComponent])
  const sceneTriangles = Math.floor(ResourceState.budgets.useVisibleVertexCount() / 3)

  const toggleStats = () => {
    renderInfoState.visible.set(!renderInfoState.visible.value)
  }

  const { t } = useTranslation()
  const [statsArray, setStatsArray] = useState<ReturnType<typeof Stats>[]>([])
  const statsRef = useRef<HTMLDivElement>(null)
  let animateId = 0

  useEffect(() => {
    return () => cancelAnimationFrame(animateId)
  }, [])

  useEffect(() => {
    setupStatsArray()
    if (props.show) animateId = requestAnimationFrame(animate)
    else cancelAnimationFrame(animateId)
  }, [props.show])

  const setupStatsArray = () => {
    if (!statsRef.current) return

    statsRef.current.innerHTML = ''

    for (let i = 0; i < 3; i++) {
      statsArray[i] = Stats()
      statsArray[i].showPanel(i)
      statsRef.current?.appendChild(statsArray[i].dom)
    }

    setStatsArray([...statsArray])
  }

  const animate = () => {
    for (const stats of statsArray) stats.update()
    animateId = requestAnimationFrame(animate)
  }

  return (
    <div className="m-1 flex flex-col gap-0.5 rounded bg-neutral-600 p-1">
      <Text className="text-text-primary-button">{t('common:debug.stats')}</Text>
      <div className="flex gap-1 [&>div]:relative" ref={statsRef} />
      <Button variant="secondary" onClick={toggleStats} size="sm">
        {renderInfoState.visible.value ? 'Hide' : 'Show'}
      </Button>
      <Button variant="secondary" onClick={downloadStateSnapshot} size="sm">
        {t('common:debug.downloadState')}
      </Button>
      {info && (
        <ul className="list-none text-sm text-text-primary-button">
          <li>
            {t('editor:viewport.state.memory')}
            <ul className="ml-2 list-none">
              <li>
                {t('editor:viewport.state.geometries')}: {info.geometries}
              </li>
              <li>
                {t('editor:viewport.state.textures')}: {info.textures}
              </li>
              <li>
                {t('editor:viewport.state.texturesMB')}: {info.texturesMB}
              </li>
              <li>
                {t('editor:viewport.state.shaderComplexity')}: {info.shaderComplexity}
              </li>
            </ul>
          </li>
          <li>
            {t('editor:viewport.state.render')}:
            <ul className="ml-2 list-none">
              <li>
                {t('editor:viewport.state.FPS')}: {Math.round(info.fps)}
              </li>
              <li>
                {t('editor:viewport.state.frameTime')}: {Math.round(info.frameTime)}ms
              </li>
              <li>
                {t('editor:viewport.state.calls')}: {info.calls}
              </li>
              <li>
                {t('editor:viewport.state.sceneTriangles')}: {sceneTriangles}
              </li>
              <li className="flex gap-1">
                <Tooltip content={t('editor:viewport.state.trianglesTooltip')}>
                  <div>{'ⓘ'}</div>
                </Tooltip>
                {t('editor:viewport.state.triangles')}: {info.triangles}
              </li>
              <li>
                {t('editor:viewport.state.points')}: {info.points}
              </li>
              <li>
                {t('editor:viewport.state.lines')}: {info.lines}
              </li>
              <li>
                {t('editor:viewport.state.lights')}: {lightQuery.length}
              </li>
            </ul>
          </li>
          <li>
            {t('editor:viewport.state.sceneComplexity')}: {info.sceneComplexity}
          </li>
        </ul>
      )}
    </div>
  )
}
