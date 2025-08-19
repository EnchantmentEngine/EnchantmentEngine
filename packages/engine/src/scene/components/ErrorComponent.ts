import {
  Component,
  ComponentErrorsType,
  defineComponent,
  getOptionalComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { Schema } from '@ir-engine/hyperflux'

export const ErrorComponent = defineComponent({
  name: 'ErrorComponent',
  schema: Schema.Record(Schema.String(), Schema.Record(Schema.String(), Schema.String())),

  useComponentErrors: <C extends Component>(entity: Entity, component: C) => {
    const errors = useOptionalComponent(entity, ErrorComponent)?.[component.name]
    return errors
  }
})

export const getEntityErrors = <C extends Component>(entity: Entity, component: C) => {
  return getOptionalComponent(entity, ErrorComponent)?.[component.name] as Record<ComponentErrorsType<C>, string>
}
