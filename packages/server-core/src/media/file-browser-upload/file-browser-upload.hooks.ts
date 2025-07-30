import { iff, isProvider } from 'feathers-hooks-common'
import { SYNC } from 'feathers-sync'

import { BadRequest } from '@feathersjs/errors'
import { HookContext } from '../../../declarations'
import verifyScope from '../../hooks/verify-scope'
import { isValidFileType } from '../FileUtil'

// An example of calculating the remaining space left on a hypothetical project max size
// const projectNameRegex = /projects\/([^/]+)/
// const PROJECT_MAX_SIZE = 100 * 1000 * 1000 //100 MB

// const checkProjectSize = async (context: HookContext) => {
//   const { data, params } = context
//   const projectNameExec = projectNameRegex.exec(data.path)
//   if (!projectNameExec) throw new BadRequest('Files must be uploaded in a project')
//   const storageProvider = getStorageProvider()
//   const projectName = projectNameExec[1]
//   const projectSize = await storageProvider.getFolderSize(`projects/${projectName}`)
//   const isCurrentFile = await storageProvider.doesExist(data.fileName, data.path)
//   let existingFileSize = 0
//   if (isCurrentFile) existingFileSize = (await storageProvider.getObject(`${data.path}${data.fileName}`)).Body.length
//   const newFileSize = params.files[0].size
//   if (newFileSize - existingFileSize + projectSize > PROJECT_MAX_SIZE) throw new BadRequest(
//       `The file you are uploading would put this project over the max project size of ${PROJECT_MAX_SIZE / 1000000} MB. Uploaded file size: ${newFileSize / 1000000 } MB. Free space in project: ${(PROJECT_MAX_SIZE - projectSize) / 1000000} MB.`
//   )
//   return context
// }

const validateFile = (context: HookContext) => {
  const args = context.arguments
  const file = args?.[1]?.files?.[0]

  if (!isValidFileType(file.mimetype, file.originalname)) {
    throw new BadRequest('Unsupported file type')
  }
}

export default {
  before: {
    all: [iff(isProvider('external'), verifyScope('editor', 'write'))],
    find: [],
    get: [],
    create: [
      (context) => {
        context[SYNC] = false
        return context
      },
      validateFile
    ],
    update: [],
    patch: [
      (context) => {
        context[SYNC] = false
        return context
      },
      validateFile
    ],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
