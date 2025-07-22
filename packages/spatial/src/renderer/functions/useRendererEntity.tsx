
import {
  Entity,
  EntityTreeComponent,
  UndefinedEntity,
  defineQuery,
  getAncestorWithComponents,
  getComponent,
  getOptionalComponent,
  useOptionalComponent,
  useQuery
} from '@ir-engine/ecs'
import { startReactor, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import React, { useLayoutEffect } from 'react'
import { RendererComponent } from '../components/RendererComponent'
import { SceneComponent } from '../components/SceneComponents'

/**
 * Returns the renderer entity that is rendering the specified entity
 * @param {Entity} entity
 * @returns {Entity}
 */
export function useRendererEntity(entity: Entity) {
  const result = useHookstate(UndefinedEntity)

  useImmediateEffect(() => {
    let unmounted = false
    const ParentSubReactor = (props: { entity: Entity }) => {
      const tree = useOptionalComponent(props.entity, EntityTreeComponent)
      const renderers = useQuery([RendererComponent])
      const matchesQuery = renderers.find((r) => getComponent(r, RendererComponent).scenes.includes(props.entity))
      const hasRenderer = !!useOptionalComponent(matchesQuery ?? UndefinedEntity, RendererComponent)?.renderer

      useLayoutEffect(() => {
        if (!matchesQuery || !hasRenderer) return
        result.set(matchesQuery)
        return () => {
          if (!unmounted) result.set(UndefinedEntity)
        }
      }, [tree?.parentEntity?.value, matchesQuery, hasRenderer])

      if (matchesQuery) return null

      if (!tree?.parentEntity?.value) return null

      return <ParentSubReactor key={tree.parentEntity.value} entity={tree.parentEntity.value} />
    }

    const root = startReactor(function useQueryReactor() {
      return <ParentSubReactor entity={entity} key={entity} />
    }, `useRendererEntity - ${entity}`)
    return () => {
      unmounted = true
      root.stop()
    }
  }, [entity])

  return result.value
}

const rendererQuery = defineQuery([RendererComponent])

export const getRendererEntity = (entity: Entity) => {
  const sceneEntity = getAncestorWithComponents(entity, [SceneComponent])
  const renderers = rendererQuery()
  const matchesQuery = renderers.find((r) => getComponent(r, RendererComponent).scenes.includes(sceneEntity))
  const hasRenderer = !!getOptionalComponent(matchesQuery ?? UndefinedEntity, RendererComponent)?.renderer
  if (matchesQuery && hasRenderer) return matchesQuery
  return UndefinedEntity
}
