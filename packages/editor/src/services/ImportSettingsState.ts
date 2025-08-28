import { KTX2EncodeDefaultArguments } from '@ir-engine/engine/src/assets/constants/CompressionParms'
import { defineState, syncStateWithLocalStorage } from '@ir-engine/hyperflux'

import { defaultLODs } from '../constants/GLTFPresets'

export const ImportSettingsState = defineState({
  name: 'ImportSettingsState',
  initial: () => ({
    LODsEnabled: false,
    selectedLODS: defaultLODs,
    imageCompression: false,
    imageSettings: KTX2EncodeDefaultArguments,
    importFolder: '/public/assets/',
    LODFolder: 'LODs/'
  }),
  extension: syncStateWithLocalStorage([
    'LODsEnabled',
    'selectedLODS',
    'imageCompression',
    'imageSettings',
    'importFolder',
    'LODFolder'
  ])
})
