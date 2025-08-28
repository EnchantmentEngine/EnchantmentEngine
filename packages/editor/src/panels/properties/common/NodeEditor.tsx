import React, { Suspense, useEffect } from 'react'

import { hasComponent, removeComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { EditorPropType } from '@ir-engine/editor/src/components/properties/Util'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { AuthoringState } from '@ir-engine/engine/src/authoring/AuthoringState'
import ComponentDropdown, { ComponentDropdownProps } from '@ir-engine/ui/src/components/editor/ComponentDropdown'
import { ComponentDropdownState } from '@ir-engine/ui/src/components/editor/ComponentDropdown/ComponentDropdownState'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { useTranslation } from 'react-i18next'

interface INodeErrorProps {
  name?: string
  children?: React.ReactNode
}

interface INodeErrorState {
  error: Error | null
}

class NodeEditorErrorBoundary extends React.Component<INodeErrorProps, INodeErrorState> {
  public state: INodeErrorState = {
    error: null
  }

  public static getDerivedStateFromError(error: Error): INodeErrorState {
    return { error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.error) {
      return (
        <div className="m-2.5 overflow-auto bg-gray-600 text-red-500">
          <Text fontWeight="bold" component="h1">
            [{this.props.name}] {this.state.error.message}
          </Text>
          <pre>{this.state.error.stack}</pre>
        </div>
      )
    }

    return this.props.children
  }
}

const documentationMap = {
  GLTFComponent: 'ModelComponent',
  RigidBodyComponent: 'RigidbodyComponent',
  TriggerCallbackComponent: 'TriggerComponent'
}

const documentationList = [
  'ModelComponent',
  'AudioComponent',
  'VideoComponent',
  'ImageComponent',
  'PrimitiveGeometryComponent',
  'GroundPlaneComponent',
  'VariantComponent',
  'ColliderComponent',
  'RigidbodyComponent',
  'TriggerComponent',
  'SpawnPointComponent',
  'LinkComponent',
  'MountPointComponent',
  'InterableComponent',
  'InputComponent',
  'ScreenshareTargetComponent',
  'AmbientLightComponent',
  'PointLightComponent',
  'SpotLightComponent',
  'DirectionalLightComponent',
  'HemisphereLightComponent',
  'LoopAnimationComponent',
  'ShadowComponent',
  'ParticleSystemComponent',
  'EnvMapComponent',
  'PostprocessingComponent'
]

const NodeEditor = ({
  description,
  children,
  name,
  entity,
  component,
  Icon
}: ComponentDropdownProps & EditorPropType) => {
  const { t } = useTranslation()

  const minimizedByDefault = false

  useEffect(() => {
    //ensure the entry exists in the state but do not modify it if it already exists
    if (name) ComponentDropdownState.addOrUpdateEntity(entity, name, minimizedByDefault, false)

    return () => {
      const entities = SelectionState.getSelectedEntities()
      //clean up the component from the state for these entities
      if (name && component && !hasComponent(entity, component)) {
        ComponentDropdownState.removeComponentEntry(entities, name)
      }
    }
  }, [])

  const _type = component?.name || ''
  const componentType = documentationMap[_type] || _type
  const hasDocs = componentType && documentationList.includes(componentType)
  const slug = hasDocs
    ? componentType
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '')
    : ''

  return (
    <ComponentDropdown
      name={name}
      description={description}
      slug={slug}
      Icon={Icon}
      onClose={
        component && hasComponent(entity, component)
          ? () => {
              const entities = SelectionState.getSelectedEntities()
              for (const entity of entities) removeComponent(entity, component)
              AuthoringState.snapshotEntities(entities)
            }
          : undefined
      }
      entity={entity}
      minimizedDefault={minimizedByDefault}
    >
      <Suspense
        fallback={<LoadingView className="block h-12 w-12" title={t('common:loader.loadingDynamic', { name })} />}
      >
        <NodeEditorErrorBoundary name={name}>{children}</NodeEditorErrorBoundary>
      </Suspense>
    </ComponentDropdown>
  )
}

export default NodeEditor
