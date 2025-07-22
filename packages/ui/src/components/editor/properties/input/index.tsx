import { UUIDComponent } from '@ir-engine/ecs'
import { getComponent, hasComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import {
  commitProperties,
  commitProperty,
  EditorComponentType,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'

import { useNodeOptions } from '@ir-engine/engine/src/authoring/functions/useNodeOptions'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlinePanTool } from 'react-icons/md'
import Button from '../../../../primitives/tailwind/Button'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'

export const InputComponentNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const inputComponent = useComponent(props.entity, InputComponent)
  const options = useNodeOptions(props.entity)

  const addSink = () => {
    const sinks = [...(inputComponent.inputSinks ?? []), getComponent(props.entity, UUIDComponent)]

    if (!hasComponent(props.entity, InputComponent)) {
      setComponent(props.entity, InputComponent, {
        inputSinks: JSON.parse(JSON.stringify(sinks))
      })
    } else {
      commitProperties(InputComponent, { inputSinks: JSON.parse(JSON.stringify(sinks)) }, [props.entity])
    }
  }

  const removeSink = (index: number) => {
    const sinks = [...inputComponent.inputSinks]
    sinks.splice(index, 1)
    commitProperties(InputComponent, { inputSinks: JSON.parse(JSON.stringify(sinks)) }, [props.entity])
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.input.name')}
      description={t('editor:properties.input.description')}
      Icon={InputComponentNodeEditor.iconComponent}
    >
      <InputGroup
        name="ActivationDistance"
        label={t('editor:properties.input.lbl-activationDistance')}
        info={t('editor:properties.input.info-activationDistance')}
      >
        <NumericInput
          value={inputComponent.activationDistance}
          onChange={updateProperty(InputComponent, 'activationDistance')}
          onRelease={commitProperty(InputComponent, 'activationDistance')}
        />
      </InputGroup>
      <div className="flex w-full flex-1 justify-center">
        <Button variant="tertiary" onClick={addSink}>
          {t('editor:properties.input.lbl-addSinkTarget')}
        </Button>
      </div>
      <div id={`inputSinks-list`}>
        {options.length > 1 && inputComponent.inputSinks?.length > 0
          ? inputComponent.inputSinks.map((sink, index) => {
              return (
                <div key={index}>
                  <InputGroup name="Target" label={t('editor:properties.input.lbl-sinkTarget')}>
                    <SelectInput
                      key={props.entity}
                      value={sink ?? 'Self'}
                      onChange={commitProperty(InputComponent, `inputSinks.${index}` as any)}
                      options={options}
                      disabled={props.multiEdit}
                    />
                  </InputGroup>
                  <div className="flex w-full flex-1 justify-center">
                    <Button variant="tertiary" onClick={() => removeSink(index)}>
                      {t('editor:properties.input.lbl-removeSinkTarget')}
                    </Button>
                  </div>
                </div>
              )
            })
          : null}
      </div>
    </NodeEditor>
  )
}

InputComponentNodeEditor.iconComponent = MdOutlinePanTool

export default InputComponentNodeEditor
