import { getComponent, useHasComponent } from '@ir-engine/ecs'
import { commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { VisualScriptComponent } from '@ir-engine/engine'
import { getState, useHookstate } from '@ir-engine/hyperflux'
import { Button } from '@ir-engine/ui'
import { VisualScriptState } from '@ir-engine/visual-script'
import { isEqual } from 'lodash'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import { Flow } from '../flow'
import './ReactFlowStyle.css'

export const ActiveVisualScript = (props: { entity }) => {
  const { entity } = props

  // reactivity
  const visualScriptState = getState(VisualScriptState)

  // get underlying data, avoid hookstate error 202
  const visualScriptComponent = getComponent(entity, VisualScriptComponent)

  if (visualScriptComponent.visualScript === null) return null
  return (
    <ReactFlowProvider>
      <Flow
        initialVisualScript={visualScriptComponent.visualScript}
        examples={{}}
        registry={visualScriptState.registries[visualScriptComponent.domain]}
        onChangeVisualScript={(newVisualScript) => {
          if (!newVisualScript) return
          if (isEqual(visualScriptComponent.visualScript, newVisualScript)) return
          commitProperty(VisualScriptComponent, 'visualScript')(newVisualScript)
        }}
      />
    </ReactFlowProvider>
  )
}

const VisualFlow = () => {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const entities = SelectionState.useSelectedEntities()
  const entity = entities[entities.length - 1]
  const validEntity = useHasComponent(entity, VisualScriptComponent)
  const flowDimensions = useHookstate({ height: 0, width: 0 })

  const addVisualScript = () => EditorControlFunctions.addOrRemoveComponent([entity], VisualScriptComponent, true)

  useEffect(() => {
    if (!ref.current) return
    const handleResize = () => {
      if (!ref.current) return
      const { height, width } = ref.current.getBoundingClientRect()
      flowDimensions.set({ height, width })
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(ref.current)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div className="flex h-full w-full flex-col" ref={ref}>
      <div
        className="flex items-center justify-center"
        style={{ height: flowDimensions.height.value, width: flowDimensions.width.value }}
      >
        {entities.length && !validEntity ? (
          <Button
            variant="tertiary"
            onClick={() => {
              addVisualScript()
            }}
          >
            {t('editor:visualScript.panel.addVisualScript')}
          </Button>
        ) : (
          <></>
        )}
        {validEntity && <ActiveVisualScript entity={entity} />}
      </div>
    </div>
  )
}

export default VisualFlow
