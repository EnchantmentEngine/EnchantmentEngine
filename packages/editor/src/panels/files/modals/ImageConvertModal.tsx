import React from 'react'
import { useTranslation } from 'react-i18next'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { useMutation } from '@ir-engine/common'
import { imageConvertPath } from '@ir-engine/common/src/schema.type.module'
import { ImageConvertDefaultParms, ImageConvertParms } from '@ir-engine/engine/src/assets/constants/ImageConvertParms'
import { useHookstate } from '@ir-engine/hyperflux'
import { Checkbox, Select } from '@ir-engine/ui'
import NumericInput from '@ir-engine/ui/src/components/editor/input/Numeric'
import Label from '@ir-engine/ui/src/primitives/tailwind/Label'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { FileDataType } from '../../../constants/AssetTypes'

export default function ImageConvertModal({
  file,
  refreshDirectory
}: {
  file: FileDataType
  refreshDirectory: () => Promise<void>
}) {
  const { t } = useTranslation()
  const modalProcessing = useHookstate(false)

  const convertProperties = useHookstate<ImageConvertParms>(ImageConvertDefaultParms)
  const imageConvertMutation = useMutation(imageConvertPath)

  const handleSubmit = async () => {
    convertProperties.src.set(file.isFolder ? `${file.url}/${file.key}` : file.url)
    imageConvertMutation
      .create({
        ...convertProperties.value
      })
      .then(() => {
        refreshDirectory()
        ModalState.closeModal()
      })
  }

  return (
    <Modal
      title={t('editor:layout.filebrowser.convert')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={ModalState.closeModal}
      submitLoading={modalProcessing.value}
    >
      <div className="ml-32 flex flex-col gap-4">
        <Text fontWeight="semibold">
          {file.name} {file.isFolder ? t('editor:layout.filebrowser.directory') : t('editor:layout.filebrowser.file')}
        </Text>
        <div className="flex items-center gap-2">
          <Label className="w-16">{t('editor:layout.filebrowser.image-convert.format')}</Label>
          <Select
            options={[
              { label: 'PNG', value: 'png' },
              { label: 'JPG', value: 'jpg' },
              { label: 'WEBP', value: 'webp' }
            ]}
            value={convertProperties.format.value}
            onChange={(value: 'png' | 'jpg' | 'webp') => convertProperties.format.set(value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="w-16">{t('editor:layout.filebrowser.image-convert.resize')}</Label>
          <Checkbox
            checked={convertProperties.resize.value}
            onChange={(value) => convertProperties.resize.set(value)}
          />
        </div>
        {convertProperties.resize.value && (
          <>
            <div className="flex items-center gap-2">
              <Label className="w-16">{t('editor:layout.filebrowser.image-convert.width')}</Label>
              <NumericInput
                className="w-52 bg-[#2C2E33] px-2 py-0.5"
                value={convertProperties.width.value}
                onChange={(value) => convertProperties.width.set(value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-16">{t('editor:layout.filebrowser.image-convert.height')}</Label>
              <NumericInput
                className="w-52 bg-[#2C2E33] px-2 py-0.5"
                value={convertProperties.height.value}
                onChange={(value) => convertProperties.height.set(value)}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
