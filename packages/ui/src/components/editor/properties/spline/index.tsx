import React from 'react'
import { useTranslation } from 'react-i18next'

import { SplineComponent } from '@ir-engine/engine/src/scene/components/SplineComponent'

import { MdOutlineTimeline } from 'react-icons/md'

import { useComponent } from '@ir-engine/ecs'
import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { NO_PROXY } from '@ir-engine/hyperflux'
import { HiPlus } from 'react-icons/hi2'
import { MdClear } from 'react-icons/md'
import { Quaternion, Vector3 } from 'three'
import EulerInput from '../../input/Euler'
import InputGroup from '../../input/Group'
import Vector3Input from '../../input/Vector3'

/**
 * SplineNodeEditor used to create and customize splines in the scene.
 *
 * @param       {Object} props
 * @constructor
 */

export const SplineNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const component = useComponent(props.entity, SplineComponent)
  const elements = component.elements

  return (
    <NodeEditor
      description={t('editor:properties.spline.description')}
      Icon={SplineNodeEditor.iconComponent}
      {...props}
    >
      <div className="flex-strech flex w-full flex-row items-center gap-2 px-6 py-1">
        <div className="flex w-full text-xs font-normal text-neutral-50">
          {t('editor:properties.spline.lbl-addNode')}
        </div>
        <div className="flex w-full justify-end">
          <HiPlus
            className="mr-5 cursor-pointer rounded-md bg-[#1A1A1A] text-white"
            size="20px"
            onClick={() => {
              const elem = { position: new Vector3(), rotation: new Quaternion() }
              const newElements = [...elements.get(NO_PROXY), elem]
              commitProperty(SplineComponent, 'elements')(newElements)
            }}
          />
        </div>
      </div>
      {elements.map(
        (
          elem,
          index // need styling
        ) => (
          <div key={index}>
            <div className="flex-end border-t-2 border-zinc-900 py-2">
              <div className="flex w-full flex-row px-6">
                <div className="flex w-full justify-start text-xs font-normal text-neutral-50">
                  {`Node ${index + 1}`}
                </div>
                <div className="flex w-full justify-end">
                  <MdClear
                    className="text-neutral-700"
                    onClick={() => {
                      const newElements = [...elements.get(NO_PROXY)].filter((_, i) => i !== index)
                      commitProperty(SplineComponent, 'elements')(newElements)
                    }}
                  />
                </div>
              </div>
              <InputGroup name="Position" label={`${t('editor:properties.transform.lbl-position')}`} className="w-auto">
                <Vector3Input
                  //style={{ maxWidth: 'calc(100% - 2px)', paddingRight: `3px`, width: '100%' }}
                  value={elem.position.value}
                  smallStep={0.01}
                  mediumStep={0.1}
                  largeStep={1}
                  onChange={(position) => {
                    commitProperty(
                      SplineComponent,
                      `elements.${index}.position` as any
                    )(new Vector3(position.x, position.y, position.z))
                  }}
                />
              </InputGroup>
              <InputGroup name="Rotation" label={`${t('editor:properties.transform.lbl-rotation')}`} className="w-auto">
                <EulerInput
                  //style={{ maxWidth: 'calc(100% - 2px)', paddingRight: `3px`, width: '100%' }}
                  quaternion={elem.rotation.value}
                  unit="°"
                  onChange={(quat) => {
                    commitProperty(SplineComponent, `elements.${index}.quaternion` as any)(quat)
                  }}
                />
              </InputGroup>
            </div>
          </div>
        )
      )}
    </NodeEditor>
  )
}

SplineNodeEditor.iconComponent = MdOutlineTimeline

export default SplineNodeEditor
