import { Params } from '@feathersjs/feathers'
import Multer from '@koa/multer'
import { createHash } from 'crypto'

import { UploadFile } from '@ir-engine/common/src/interfaces/UploadAssetInterface'
import { StaticResourceType, uploadScriptPath, UserType } from '@ir-engine/common/src/schema.type.module'
import { SupportedScriptImports } from '@ir-engine/engine/src/script/SupportedScriptImports'

import { Application } from '../../../declarations'
import { uploadAsset } from '../upload-asset/upload-asset.service'
import { convertImportToGlobal, transpileTypeScript, validateScript } from './upload-script-utils'
import hooks from './upload-script.hooks'

const multipartMiddleware = Multer({ limits: { fieldSize: Infinity } })

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [uploadScriptPath]: {
      create: (
        data: UploadScriptData,
        params: UploadParams
      ) => Promise<{
        rawScript: StaticResourceType
        processedScript: StaticResourceType
      }>
    }
  }
}

export interface UploadParams extends Params {
  files: UploadFile[]
  user: UserType
}

export type UploadScriptArgs = {
  project: string
  name?: string
  path?: string
  file: UploadFile // uploaded file or strings
}

export type UploadScriptData = {
  args: {
    path: string
    name?: string
    project: string
  }
}

const fetchScriptAsText = async (script: StaticResourceType) => {
  const url = script.url
  const response = await fetch(url)
  return await response.text()
}

const processScript = async (
  app: Application,
  script: StaticResourceType,
  uploadArgs: {
    project: string
    path: string
    name: string
  }
) => {
  let scriptText = await fetchScriptAsText(script)
  const fileName = script.name || 'script.tsx'
  const isTypeScript = true

  const validationErrors = validateScript(scriptText)
  if (validationErrors.length > 0) {
    const errorMessages = validationErrors.map((error) => error.reason).join('\n')
    throw new Error(`Script contains disallowed features:\n${errorMessages}`)
  }

  if (isTypeScript) {
    try {
      scriptText = transpileTypeScript(scriptText, fileName)
    } catch (error) {
      throw new Error(`TypeScript transpilation failed: ${(error as Error).message}`)
    }
  }

  for (const { import: imp, global } of SupportedScriptImports) {
    scriptText = convertImportToGlobal(scriptText, imp, global)
  }

  const buffer = Buffer.from(scriptText)

  const outputFileName = fileName.replace(/\.[^\.]+$/, '.js')

  return uploadAsset(app, {
    path: 'public/processed-scripts/',
    name: outputFileName,
    file: {
      buffer,
      originalname: outputFileName,
      mimetype: 'application/javascript'
    } as UploadFile,
    project: uploadArgs.project
  })
}

const uploadScripts = (app: Application) => async (data: UploadScriptData, params: UploadParams) => {
  if (typeof data.args === 'string') data.args = JSON.parse(data.args)
  const files = params.files

  if (!data.args.project) throw new Error('No project specified')

  if (!files || files.length === 0) throw new Error('No files to upload')

  if (files.length > 1) throw new Error('Only one file is allowed at a time')

  const [file] = files

  file.mimetype = 'application/x-typescript'

  const rawScript = await uploadAsset(app, {
    path: data.args.path,
    name: file.originalname,
    file: file,
    project: data.args.project
  })

  const processedScript = await processScript(app, rawScript, {
    project: data.args.project,
    path: data.args.path,
    name: rawScript.name!
  })

  return {
    rawScript,
    processedScript
  }
}

export const createStaticResourceHash = (file: Buffer) => {
  return createHash('sha3-256').update(new Uint8Array(file)).digest('hex')
}

export default (app: Application): void => {
  app.use(
    uploadScriptPath,
    {
      create: uploadScripts(app)
    },
    {
      koa: {
        before: [
          multipartMiddleware.any(),
          async (ctx, next) => {
            if (ctx?.feathers && ctx.method !== 'GET') {
              ctx.feathers.headers = ctx.headers
              ;(ctx as any).feathers.files = (ctx as any).request.files.media
                ? (ctx as any).request.files.media
                : ctx.request.files
            }

            await next()
            return ctx.body
          }
        ]
      }
    }
  )
  const service = app.service(uploadScriptPath)

  service.hooks(hooks)
}
