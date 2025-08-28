import { ThemeState, useThemeProvider } from '@ir-engine/client-core/src/common/services/ThemeService'
import * as ECS from '@ir-engine/ecs'
import '@ir-engine/spatial'
import { useEngineCanvas } from '@ir-engine/spatial/src/renderer/functions/useEngineCanvas'
import React, { useEffect, useRef } from 'react'
import SceneDecorator from './SceneDecorator'

globalThis.ECS = ECS

const ThemeProvider = () => {
  useThemeProvider()
  useEffect(() => ThemeState.setTheme('dark'), [])
  return null
}

const CanvasEngine = () => {
  const ref = useRef(document.getElementById('storybook-root'))
  useEngineCanvas(ref)

  return <></>
}

export default function EngineDecorator({ children, sceneName }: React.PropsWithChildren<{ sceneName?: string }>) {
  return (
    <>
      <ThemeProvider />
      <CanvasEngine />
      {sceneName && <SceneDecorator sceneName={sceneName} />}
      {children}
    </>
  )
}
