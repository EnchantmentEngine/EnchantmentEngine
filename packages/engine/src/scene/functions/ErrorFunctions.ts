import { isEmpty } from 'lodash'

import {
  Component,
  ComponentErrorsType,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

import { ErrorComponent } from '../components/ErrorComponent'

export const addError = <C extends Component>(
  entity: Entity,
  Component: C,
  error: ComponentErrorsType<C>,
  message?: string
) => {
  console.error('[addError]:', entity, Component.name, error, message)
  if (!hasComponent(entity, ErrorComponent)) setComponent(entity, ErrorComponent)
  const errors = getComponent(entity, ErrorComponent)
  if (!errors[Component.name]) errors[Component.name] = {}
  errors[Component.name][error] = message ?? ''
  setComponent(entity, ErrorComponent)
}

export const removeError = <C extends Component>(entity: Entity, Component: C, error: ComponentErrorsType<C>) => {
  if (!hasComponent(entity, ErrorComponent)) return
  const errors = getComponent(entity, ErrorComponent)
  const componentErrors = errors[Component.name]
  if (componentErrors) delete componentErrors[error]
  if (isEmpty(componentErrors)) delete errors[Component.name]
  if (isEmpty(errors)) removeComponent(entity, ErrorComponent)
}

export const clearErrors = (entity: Entity, Component: Component) => {
  if (!hasComponent(entity, ErrorComponent)) return
  const errors = getComponent(entity, ErrorComponent)
  delete errors[Component.name]
  if (isEmpty(errors)) removeComponent(entity, ErrorComponent)
  else setComponent(entity, ErrorComponent)
}
