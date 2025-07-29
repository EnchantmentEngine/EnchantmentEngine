import React, { useEffect } from 'react'

import { Entity, useAncestorWithComponents, useEntityContext } from '@ir-engine/ecs'
import { defineComponent, hasComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useMutableState } from '@ir-engine/hyperflux'
import { GraphJSON, IRegistry, VisualScriptState, defaultVisualScript } from '@ir-engine/visual-script'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { parseStorageProviderURLs } from '@ir-engine/spatial/src/resources/parseSceneJSON'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { useVisualScriptRunner } from '../systems/useVisualScriptRunner'

export const VisualScriptDomain = {
  ECS: 'ECS'
} as const

export type VisualScriptDomainType = (typeof VisualScriptDomain)[keyof typeof VisualScriptDomain]

export const VisualScriptComponent = defineComponent({
  name: 'VisualScriptComponent',
  jsonID: 'EE_visual_script',

  schema: S.Object({
    domain: S.Enum(VisualScriptDomain, {
      $comment: "A string enum, ie. one of the following values: 'ECS'",
      default: VisualScriptDomain.ECS
    }),
    visualScript: S.Type<GraphJSON | null>({
      default: () => parseStorageProviderURLs(defaultVisualScript),
      deserialize(curr, value) {
        if (!value) return value
        return parseStorageProviderURLs(value)
      }
    }),
    run: S.Bool(),
    disabled: S.Bool()
  }),

  // we make reactor for each component handle the engine
  reactor: () => {
    const entity = useEntityContext()
    const visualScript = useComponent(entity, VisualScriptComponent)
    const visualScriptState = useMutableState(VisualScriptState)
    const canPlay = visualScript.run && !visualScript.disabled
    const registry = visualScriptState.registries[visualScript.domain].get({ noproxy: true }) as IRegistry
    const gltfAncestor = useAncestorWithComponents(entity, [GLTFComponent])

    const visualScriptRunner = useVisualScriptRunner({
      visualScriptJson: visualScript.visualScript,
      autoRun: canPlay,
      registry
    })

    useEffect(() => {
      if (visualScript.disabled) return
      visualScript.run ? visualScriptRunner.play() : visualScriptRunner.pause()
    }, [visualScript.run])

    useEffect(() => {
      if (!visualScript.disabled) return
      setComponent(entity, VisualScriptComponent, { run: false })
    }, [visualScript.disabled])

    if (!gltfAncestor) return null

    return <LoadReactor entity={entity} gltfAncestor={gltfAncestor} key={gltfAncestor} />
  }
})

const LoadReactor = (props: { entity: Entity; gltfAncestor: Entity }) => {
  const loaded = GLTFComponent.useSceneLoaded(props.gltfAncestor)

  useEffect(() => {
    setComponent(props.entity, VisualScriptComponent, { run: true })

    return () => {
      if (!hasComponent(props.entity, VisualScriptComponent)) return
      setComponent(props.entity, VisualScriptComponent, { run: false })
    }
  }, [loaded])

  return null
}
