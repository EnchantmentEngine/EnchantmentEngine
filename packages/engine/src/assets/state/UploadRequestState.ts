import { defineState } from '@ir-engine/hyperflux'

export type UploadRequest = {
  file: File
  projectName: string
  callback?: () => void
  path?: string
}

export const UploadRequestState = defineState({
  name: 'UploadRequestState',
  initial: {
    queue: [] as UploadRequest[],
    isOnPublishing: false
  }
})

export function executionPromiseKey(request: UploadRequest) {
  return `${request.projectName}-${request.file.name}`
}
