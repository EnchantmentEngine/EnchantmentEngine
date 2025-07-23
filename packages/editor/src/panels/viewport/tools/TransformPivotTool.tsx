import { setTransformPivot } from '@ir-engine/editor/src/functions/transformFunctions'
import { EditorHelperState } from '@ir-engine/editor/src/services/EditorHelperState'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { TransformPivot } from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { Tooltip } from '@ir-engine/ui'
import { ViewportButton } from '@ir-engine/ui/editor'
import { FlexAlignBottomMd, Globe01Md, SelectionMd, SquareMd } from '@ir-engine/ui/src/icons'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { t } from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'

const options = [
  {
    label: t('editor:toolbar.transformPivot.lbl-singleOrigin'),
    description: t('editor:toolbar.transformPivot.info-single-origin'),
    value: TransformPivot.FirstSelected,
    icon: SelectionMd
  },
  {
    label: t('editor:toolbar.transformPivot.lbl-center'),
    description: t('editor:toolbar.transformPivot.info-center'),
    value: TransformPivot.Center,
    icon: SquareMd
  },
  {
    label: t('editor:toolbar.transformPivot.lbl-floor'),
    description: t('editor:toolbar.transformPivot.info-floor'),
    value: TransformPivot.Bottom,
    icon: FlexAlignBottomMd
  },
  {
    label: t('editor:toolbar.transformPivot.lbl-worldOrigin'),
    description: t('editor:toolbar.transformPivot.info-world-origin'),
    value: TransformPivot.Origin,
    icon: Globe01Md
  }
]

const TransformPivotTool = () => {
  const { t } = useTranslation()

  const transformPivot = useHookstate(getMutableState(EditorHelperState).transformPivot)

  return (
    <div className="flex items-center gap-x-3">
      <Tooltip position={'auto'} content={t('editor:toolbar.transformSpace.description')}>
        <Text className={'dark:text-[#A3A3A3]'} fontSize={'sm'}>
          {t('editor:toolbar.transformPivot.lbl-pivot')}
        </Text>
      </Tooltip>
      {options.map(({ label, description, value, icon }) => {
        return (
          <Tooltip position="bottom" content={t(label)} key={value}>
            <ViewportButton
              selected={transformPivot.value === value}
              lean={true}
              onClick={() => setTransformPivot(value)}
              icon={icon}
            />
          </Tooltip>
        )
      })}
    </div>
  )
}

export default TransformPivotTool
