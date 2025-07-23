import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

import { fileBrowserPath } from '@ir-engine/common/src/schemas/media/file-browser.schema'
import type { ImageConvertParms } from '@ir-engine/engine/src/assets/constants/ImageConvertParms'

import { imageConvertPath } from '@ir-engine/common/src/schema.type.module'
import { Application } from '../../../declarations'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [imageConvertPath]: {
      create: (data: ImageConvertParms) => Promise<string | string[]>
    }
  }
}

const convertImage =
  (app: Application) =>
  (data: ImageConvertParms): Promise<string | string[]> => {
    const projectDir = path.join(appRootPath.path, 'packages/projects')
    const inURI = /.*(projects\/.*)$/.exec(data.src)![1]
    const inPath = path.join(projectDir, inURI)
    const fileData = fs.statSync(inPath)
    const isDir = fileData.isDirectory()
    const project = inURI.split('/')[1]

    async function doConvert(inPath) {
      const outPath = inPath.replace(/\.[^\.]+$/, `.${data.format}`)
      const outURIDir = isDir ? inURI : path.dirname(inURI)
      const projectRelativeDirectoryPath = outURIDir.split('/').slice(2).join('/')
      const fileName = /[^\\/]*$/.exec(outPath)![0]
      const image = sharp(inPath)
      if (data.width && data.height) {
        image.resize(data.width, data.height)
      }
      if (data.flipX) {
        image.flip(true)
      }
      if (data.flipY) {
        image.flip(false)
      }
      await image.toFile(outPath)
      const result = await app.service(fileBrowserPath).patch(null, {
        project,
        path: projectRelativeDirectoryPath + '/' + fileName,
        body: fs.readFileSync(outPath),
        contentType: `image/${data.format}`
      })
      return result.url
    }

    if (isDir) {
      const files = fs.readdirSync(inPath).map((file) => path.join(inPath, file))
      return Promise.all(files.map(doConvert))
    }
    return doConvert(inPath)
  }

export default (app: Application): any => {
  app.use(imageConvertPath, {
    create: convertImage(app)
  })
}
