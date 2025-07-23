import { EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { BsPlusSquare } from 'react-icons/bs'
import { LuImage } from 'react-icons/lu'
import { Quaternion, Vector3 } from 'three'
import Text from '../../../../primitives/tailwind/Text'
import InputGroup from '../../input/Group'
import StringInput from '../../input/String'

export const GalleryNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const elements = ['hello', 'bye', 'thanks'] // temp use

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.gallery.name')}
      description={t('editor:properties.gallery.description')}
      Icon={GalleryNodeEditor.iconComponent}
    >
      <div className="flex w-full items-center gap-2 py-1">
        <Text fontSize="xs" className="ml-14 w-full">
          {t('editor:properties.gallery.lbl-thumbnail')}
        </Text>
        <div className="flex w-full justify-end px-8">
          <BsPlusSquare
            className="text-white"
            onClick={() => {
              const elem = { position: new Vector3(), quaternion: new Quaternion() }
              const newElements = [...elements, elem]
              //commitProperty(, 'elements')(newElements)
            }}
          />
        </div>
      </div>
      {elements.map(
        (
          elem,
          index // need styling
        ) => (
          <div key={elem + index} className="flex-end relative border-t-2 border-zinc-900 py-2">
            <Text className="absolute left-6 text-[#FAFAFA]" fontSize="sm">
              {t('editor:properties.gallery.lbl-asset') + ' ' + (index + 1)}
            </Text>
            <InputGroup label={`${t('editor:properties.gallery.lbl-thumbnail')} ${index + 1}`}>
              <StringInput
                value={''}
                onChange={(value) => {
                  //updateProperty(, '')
                }}
                onRelease={(value) => {
                  //commitProperty(, '')
                }}
              />
            </InputGroup>
            <InputGroup label={`${t('editor:properties.gallery.lbl-performerURL')} ${index + 1}`}>
              <StringInput
                value={''}
                onChange={(value) => {
                  //updateProperty(, '')
                }}
                onRelease={(value) => {
                  //commitProperty(, '')
                }}
              />
            </InputGroup>
          </div>
        )
      )}
    </NodeEditor>
  )
}

GalleryNodeEditor.iconComponent = LuImage

export default GalleryNodeEditor
