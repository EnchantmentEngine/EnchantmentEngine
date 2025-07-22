import {
  Component,
  ComponentErrorsType,
  defineComponent,
  getOptionalMutableComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export const ErrorComponent = defineComponent({
  name: 'ErrorComponent',
  schema: S.Record(S.String(), S.Record(S.String(), S.String())),

  useComponentErrors: <C extends Component>(entity: Entity, component: C) => {
    const errors = useOptionalComponent(entity, ErrorComponent)?.[component.name]
    return errors
  }
})

export const getEntityErrors = <C extends Component>(entity: Entity, component: C) => {
  return getOptionalMutableComponent(entity, ErrorComponent)?.[component.name].value as Record<
    ComponentErrorsType<C>,
    string
  >
}
