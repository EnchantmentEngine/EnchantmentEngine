import React from 'react'

import { uploadToFeathersService } from '@ir-engine/client-core/src/util/upload'
import { fileBrowserUploadPath } from '@ir-engine/common/src/schema.type.module'
import {
  KTX2EncodeArguments,
  KTX2EncodeDefaultArguments
} from '@ir-engine/engine/src/assets/constants/CompressionParms'
import { ImmutableArray, useHookstate } from '@ir-engine/hyperflux'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { Button, Checkbox, Input, Select } from '@ir-engine/ui'
import { Slider } from '@ir-engine/ui/editor'
import InputGroup from '@ir-engine/ui/src/components/editor/input/Group'
import SelectInput from '@ir-engine/ui/src/components/editor/input/Select'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { useTranslation } from 'react-i18next'
import { MdClose } from 'react-icons/md'
import { FileDataType } from '../../constants/AssetTypes'
import { compressImage } from '../../functions/assetFunctions'

const UASTCFlagOptions = [
  { label: 'Fastest', value: 0 },
  { label: 'Faster', value: 1 },
  { label: 'Default', value: 2 },
  { label: 'Slower', value: 3 },
  { label: 'Very Slow', value: 4 },
  { label: 'Mask', value: 0xf },
  { label: 'UASTC Error', value: 8 },
  { label: 'BC7 Error', value: 16 },
  { label: 'Faster Hints', value: 64 },
  { label: 'Fastest Hints', value: 128 },
  { label: 'Disable Flip and Individual', value: 256 }
]

export default function ImageCompressionPanel({
  selectedFiles,
  refreshDirectory
}: {
  selectedFiles: ImmutableArray<FileDataType>
  refreshDirectory: () => Promise<void>
}) {
  const { t } = useTranslation()

  const compressProperties = useHookstate<KTX2EncodeArguments>(KTX2EncodeDefaultArguments)
  const compressionLoading = useHookstate(false)

  const compressContentInBrowser = async () => {
    compressionLoading.set(true)

    for (const file of selectedFiles) {
      compressProperties.src.set(file.type === 'folder' ? `${file.url}/${file.key}` : file.url)
      await uploadImage(file, await compressImage(compressProperties.value))
    }
    await refreshDirectory()

    compressionLoading.set(false)
    ModalState.closeModal()
  }

  const uploadImage = async (props: FileDataType, data: ArrayBuffer) => {
    const newFileName = props.key.replace(/.*\/(.*)\..*/, '$1') + '.ktx2'
    const path = props.key.replace(/(.*\/).*/, '$1')
    const [_projFolder, orgName, projectName] = props.key.split('/')
    const relativePath = path.replace('projects/' + orgName + '/' + projectName + '/', '')

    const file = new File([data], newFileName, { type: 'image/ktx2' })

    try {
      await uploadToFeathersService(fileBrowserUploadPath, [file], {
        args: [
          {
            project: orgName + '/' + projectName,
            path: relativePath + file.name,
            contentType: file.type
          }
        ]
      }).promise
    } catch (err) {
      console.log('Error uploading compressed image', err)
    }
  }

  let title: string
  if (selectedFiles.length === 1) {
    title = selectedFiles[0].name
  } else {
    title = selectedFiles.length + ' Items'
  }

  return (
    <div className="max-h-[80vh] w-full min-w-[400px] max-w-[680px] overflow-y-auto rounded-xl bg-[#212226]">
      <div className="relative mb-3 flex items-center justify-center px-8 py-3">
        <Text className="leading-6">{t('editor:properties.model.transform.compressImage')}</Text>
        <Button
          variant="tertiary"
          className="absolute right-0 border-0 dark:bg-transparent dark:text-[#A3A3A3]"
          onClick={() => ModalState.closeModal()}
        >
          <MdClose />
        </Button>
      </div>

      <div className="mx-auto grid w-4/5 min-w-[400px] justify-center gap-y-2">
        <InputGroup
          containerClassName="w-full justify-start flex-nowrap"
          name="mode"
          label={t('editor:properties.model.transform.dst')}
        >
          <Input value={title} disabled />
        </InputGroup>
        <div className="w-full border border-[#2B2C30]" />
        <InputGroup
          containerClassName="w-full justify-start flex-nowrap"
          infoClassName=""
          name="mode"
          label={t('editor:properties.model.transform.mode')}
          info={t('editor:properties.model.transform.modeTooltip')}
        >
          <Select
            options={[
              { label: 'ETC1S', value: 'ETC1S' },
              { label: 'UASTC', value: 'UASTC' }
            ]}
            value={compressProperties.mode.value}
            onChange={(val: 'ETC1S' | 'UASTC') => compressProperties.mode.set(val)}
          />
        </InputGroup>
        <InputGroup
          containerClassName="w-full justify-start flex-nowrap"
          infoClassName=""
          className="w-min"
          name="flipY"
          label={t('editor:properties.model.transform.flipY')}
          info={t('editor:properties.model.transform.flipYTooltip')}
        >
          <Checkbox checked={compressProperties.flipY.value} onChange={compressProperties.flipY.set} />
        </InputGroup>
        <InputGroup
          containerClassName="w-full justify-start flex-nowrap"
          infoClassName=""
          className="w-min"
          name="linear"
          label={t('editor:properties.model.transform.srgb')}
          info={t('editor:properties.model.transform.srgbTooltip')}
        >
          <Checkbox checked={compressProperties.srgb.value} onChange={compressProperties.srgb.set} />
        </InputGroup>
        <InputGroup
          containerClassName="w-full justify-start flex-nowrap"
          infoClassName=""
          name="mipmaps"
          className="w-min"
          label={t('editor:properties.model.transform.mipmaps')}
          info={t('editor:properties.model.transform.mipmapsTooltip')}
        >
          <Checkbox checked={compressProperties.mipmaps.value} onChange={compressProperties.mipmaps.set} />
        </InputGroup>
        <InputGroup
          containerClassName="w-full justify-start flex-nowrap"
          infoClassName=""
          name="normalMap"
          className="w-min"
          label={t('editor:properties.model.transform.normalMap')}
          info={t('editor:properties.model.transform.normalMapTooltip')}
        >
          <Checkbox checked={compressProperties.normalMap.value} onChange={compressProperties.normalMap.set} />
        </InputGroup>
        {compressProperties.mode.value === 'ETC1S' && (
          <>
            <InputGroup
              containerClassName="w-full justify-start flex-nowrap"
              infoClassName=""
              name="quality"
              label={t('editor:properties.model.transform.quality')}
              info={t('editor:properties.model.transform.qualityTooltip')}
            >
              <Slider
                label={''}
                value={compressProperties.quality.value}
                onChange={compressProperties.quality.set}
                onRelease={compressProperties.quality.set}
                min={1}
                max={255}
                step={1}
              />
            </InputGroup>
            <InputGroup
              containerClassName="w-full justify-start flex-nowrap"
              infoClassName=""
              name="compressionLevel"
              label={t('editor:properties.model.transform.compressionLevel')}
              info={t('editor:properties.model.transform.compressionLevelTooltip')}
            >
              <Slider
                label={''}
                value={compressProperties.compressionLevel.value}
                onChange={compressProperties.compressionLevel.set}
                onRelease={compressProperties.compressionLevel.set}
                min={0}
                max={6}
                step={1}
              />
            </InputGroup>
          </>
        )}
        {compressProperties.mode.value === 'UASTC' && (
          <>
            <InputGroup
              containerClassName="w-full justify-start flex-nowrap"
              infoClassName=""
              name="uastcFlags"
              label={t('editor:properties.model.transform.uastcFlags')}
              info={t('editor:properties.model.transform.uastcFlagsTooltip')}
            >
              <SelectInput
                options={UASTCFlagOptions}
                value={compressProperties.uastcFlags.value}
                onChange={(val: number) => compressProperties.uastcFlags.set(val)}
              />
            </InputGroup>
            <InputGroup
              containerClassName="w-full justify-start flex-nowrap"
              infoClassName=""
              name="uastcZstandard"
              label={t('editor:properties.model.transform.uastcZstandard')}
              info={t('editor:properties.model.transform.uastcZstandardTooltip')}
              className="w-min"
            >
              <Checkbox
                checked={compressProperties.uastcZstandard.value}
                onChange={compressProperties.uastcZstandard.set}
              />
            </InputGroup>
          </>
        )}
      </div>

      <div className="mb-6 flex justify-end px-8">
        {compressionLoading.value ? (
          <LoadingView spinnerOnly className="mx-0 h-12 w-12" />
        ) : (
          <Button variant="primary" onClick={compressContentInBrowser}>
            {t('editor:properties.model.transform.compress')}
          </Button>
        )}
      </div>
    </div>
  )
}
