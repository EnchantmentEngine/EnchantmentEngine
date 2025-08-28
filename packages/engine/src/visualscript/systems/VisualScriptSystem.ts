import { matches, Validator } from 'ts-matches'

import { hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { defineAction, defineActionQueue } from '@ir-engine/hyperflux'

import { useEffect } from 'react'
import { VisualScriptComponent } from '../components/VisualScriptComponent'

export const VisualScriptActions = {
  execute: defineAction({
    type: 'ee.engine.VisualScript.EXECUTE',
    entity: matches.number as Validator<unknown, Entity>
  }),
  stop: defineAction({
    type: 'ee.engine.VisualScript.STOP',
    entity: matches.number as Validator<unknown, Entity>
  }),
  executeAll: defineAction({
    type: 'ee.engine.VisualScript.EXECUTEALL',
    entity: matches.number as Validator<unknown, Entity>
  }),
  stopAll: defineAction({
    type: 'ee.engine.VisualScript.STOPALL',
    entity: matches.number as Validator<unknown, Entity>
  })
}

export const visualScriptQuery = defineQuery([VisualScriptComponent])

const executeQueue = defineActionQueue(VisualScriptActions.execute.matches)
const stopQueue = defineActionQueue(VisualScriptActions.stop.matches)
const execute = () => {
  for (const action of executeQueue()) {
    const entity = action.entity
    if (hasComponent(entity, VisualScriptComponent)) setComponent(entity, VisualScriptComponent, { run: true })
  }

  for (const action of stopQueue()) {
    const entity = action.entity
    if (hasComponent(entity, VisualScriptComponent)) setComponent(entity, VisualScriptComponent, { run: false })
  }
}

const reactor = () => {
  useEffect(() => {
    /** @todo currently this creates an instance of each component, which can lead to a lot of unnecessary extra memory */
    // VisualScriptState.registerProfile(registerEngineProfile, VisualScriptDomain.ECS)
  }, [])
  return null
}

export const VisualScriptSystem = defineSystem({
  uuid: 'ee.engine.VisualScriptSystem',
  insert: { with: InputSystemGroup },
  execute,
  reactor
})
