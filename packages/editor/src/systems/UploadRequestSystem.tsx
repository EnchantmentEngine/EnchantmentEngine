import { useEffect } from 'react'

import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { UploadRequestState } from '@ir-engine/engine/src/assets/state/UploadRequestState'
import { getMutableState, getState, NO_PROXY, useState } from '@ir-engine/hyperflux'

import { uploadProjectFiles } from '../functions/assetFunctions'
import { EditorState } from '../services/EditorServices'
import { ImportSettingsState } from '../services/ImportSettingsState'

export const UploadRequestSystem = defineSystem({
  uuid: 'ee.editor.UploadRequestSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const uploadRequestState = useState(getMutableState(UploadRequestState))
    useEffect(() => {
      const uploadRequests = uploadRequestState.queue.get(NO_PROXY)
      if (uploadRequests.length === 0) return
      const publishSceneName = getState(EditorState).sceneName?.split('.').shift()
      const publishFolder = '/public/publish/' + publishSceneName + '/'
      const importSettings = getState(ImportSettingsState)

      const uploadPromises = uploadRequests.map((uploadRequest) => {
        const projectName = uploadRequest.projectName
        let uploadFolderPath = `projects/${projectName}${
          uploadRequest.path ? uploadRequest.path : importSettings.importFolder
        }`
        if (uploadRequestState.isOnPublishing.value === true) {
          uploadFolderPath = `projects/${projectName}${publishFolder}`
        }
        return Promise.all(uploadProjectFiles(projectName, [uploadRequest.file], [uploadFolderPath]).promises).then(
          uploadRequest.callback
        )
      })

      uploadRequestState.queue.set([])
    }, [uploadRequestState.queue.length])
    return null
  }
})
