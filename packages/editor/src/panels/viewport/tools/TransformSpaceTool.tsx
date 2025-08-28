import { setTransformSpace } from '@ir-engine/editor/src/functions/transformFunctions'
import { EditorHelperState } from '@ir-engine/editor/src/services/EditorHelperState'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { TransformSpace } from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { Tooltip } from '@ir-engine/ui'
import { ViewportButton } from '@ir-engine/ui/editor'
import { Globe01Md, Local } from '@ir-engine/ui/src/icons'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { t } from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'

const transformSpaceOptions = [
  {
    label: t('editor:toolbar.transformSpace.lbl-selection'),
    description: t('editor:toolbar.transformSpace.info-selection'),
    value: TransformSpace.local
  },
  {
    label: t('editor:toolbar.transformSpace.lbl-world'),
    description: t('editor:toolbar.transformSpace.info-world'),
    value: TransformSpace.world
  }
]

const TransformSpaceTool = () => {
  const { t } = useTranslation()

  const transformSpace = useHookstate(getMutableState(EditorHelperState).transformSpace)

  return (
    <div className="flex items-center gap-x-3">
      <Tooltip position={'right'} content={t('editor:toolbar.transformSpace.description')}>
        <Text className={'dark:text-[#A3A3A3]'} fontSize={'sm'}>
          {t('editor:toolbar.transformSpace.lbl-space')}
        </Text>
      </Tooltip>
      <Tooltip position={'bottom'} content={t('editor:toolbar.transformSpace.lbl-global')}>
        <ViewportButton
          lean={true}
          selected={transformSpace.value === TransformSpace.world}
          onClick={() => setTransformSpace(TransformSpace.world)}
          icon={Globe01Md}
        />
      </Tooltip>
      <Tooltip position={'bottom'} content={t('editor:toolbar.transformSpace.lbl-local')}>
        <ViewportButton
          lean={true}
          selected={transformSpace.value === TransformSpace.local}
          onClick={() => setTransformSpace(TransformSpace.local)}
          icon={Local}
        />
      </Tooltip>
    </div>
  )
}

export default TransformSpaceTool
