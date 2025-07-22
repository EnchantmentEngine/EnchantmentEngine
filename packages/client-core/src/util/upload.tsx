import i18n from 'i18next'

import config from '@ir-engine/common/src/config'
import { defineState, getMutableState, none, useMutableState } from '@ir-engine/hyperflux'

import '@ir-engine/common/src/utils/jsonUtils'

import { ServiceTypes } from '@ir-engine/common/declarations'
import { cleanFileNameFile } from '@ir-engine/common/src/utils/cleanFileName'
import { AuthState } from '../user/services/AuthService'
import { RethrownError } from './errors'

export type CancelableUploadPromiseReturnType<T = any> = { cancel: () => void; promise: Promise<T | T[]> }
export type CancelableUploadPromiseArrayReturnType<T = any> = { cancel: () => void; promises: Array<Promise<T | T[]>> }

const getFileKeys = (files: Array<File> | File) => {
  const keys = [] as string[]
  if (Array.isArray(files)) {
    files.forEach((file) => {
      keys.push(file.name)
    })
  } else {
    keys.push(files.name)
  }

  return keys
}

export const useUploadingFiles = () => {
  const fileUploadState = useMutableState(FileUploadState).value
  const values = Object.values(fileUploadState)
  const total = values.length
  const completed = values.reduce((prev, curr) => (curr === 1 ? prev + 1 : prev), 0)
  const sum = values.reduce((prev, curr) => prev + curr, 0)
  const progress = sum ? (sum / total) * 100 : 0
  return { completed, total, progress }
}

export const FileUploadState = defineState({
  name: 'FileUploadState',
  initial: {} as Record<string, number>,

  startFileUpload: (files: Array<File>) => {
    const keys = getFileKeys(files)
    const toMerge = keys.reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: 0
      }),
      {}
    )
    getMutableState(FileUploadState).merge(toMerge)
  },

  updateFileUpload: (files: Array<File>, progress: number) => {
    const keys = getFileKeys(files)
    progress = Math.min(progress, 0.9)
    const toMerge = keys.reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: progress
      }),
      {}
    )
    getMutableState(FileUploadState).merge(toMerge)
  },

  endFileUpload: (files: Array<File>) => {
    const keys = getFileKeys(files)
    const toMerge = keys.reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: none
      }),
      {}
    )
    getMutableState(FileUploadState).merge(toMerge)
  }
})

export const uploadToFeathersService = (
  service: keyof ServiceTypes,
  files: Array<File>,
  params: ServiceTypes[typeof service]['create']['params'], // todo make this type work
  onUploadProgress?: (progress: number) => any
): CancelableUploadPromiseReturnType<Awaited<ReturnType<ServiceTypes[typeof service]['create']['params']>>> => {
  const token = getMutableState(AuthState).authUser.accessToken.value
  const request = new XMLHttpRequest()
  request.timeout = 10 * 60 * 1000 // 10 minutes - need to support big files on slow connections
  let aborted = false

  FileUploadState.startFileUpload(files)

  return {
    cancel: () => {
      aborted = true
      request.abort()
    },
    promise: new Promise<string[]>((resolve, reject) => {
      request.upload.addEventListener('progress', (e) => {
        if (aborted) return
        const progress = e.loaded / e.total
        FileUploadState.updateFileUpload(files, progress)
        if (onUploadProgress) onUploadProgress(progress)
      })

      request.upload.addEventListener('error', (error) => {
        if (aborted) return
        reject(new RethrownError(i18n.t('editor:errors.uploadFailed'), error))
      })

      request.addEventListener('readystatechange', (e) => {
        if (request.readyState === XMLHttpRequest.DONE) {
          FileUploadState.endFileUpload(files)
          const status = request.status

          if (status === 0 || (status >= 200 && status < 400)) {
            resolve(JSON.parse(request.responseText))
          } else {
            if (aborted) return
            console.error('Oh no! There has been an error with the request!', request, e)
            if (status === 403 || status === 400) {
              const errorResponse = JSON.parse(request.responseText)
              reject(new Error(errorResponse.message))
            } else {
              reject()
            }
          }
        }
      })

      const formData = new FormData()
      Object.entries(params).forEach(([key, val]: any) => {
        formData.set(key, typeof val === 'object' ? JSON.stringify(val) : val)
      })

      if (Array.isArray(files)) {
        files.forEach((file) => {
          file = cleanFileNameFile(file)
          formData.append('media[]', file)
        })
      } else {
        const file = cleanFileNameFile(files)
        formData.set('media', file)
      }

      request.open('post', `${config.client.serverUrl}/${service}`, true)
      request.setRequestHeader('Authorization', `Bearer ${token}`)
      request.send(formData)
    })
  }
}

/**
 * matchesFileTypes function used to match file type with existing file types.
 *
 * @param file      [object contains file data]
 * @param fileTypes [Array contains existing file types]
 */

export function matchesFileTypes(file: File, fileTypes: string[]) {
  for (const pattern of fileTypes) {
    if (pattern.startsWith('.')) {
      if (file.name.toLowerCase().endsWith(pattern)) {
        return true
      }
    } else if (file.type.startsWith(pattern)) {
      return true
    }
  }
  return false
}
