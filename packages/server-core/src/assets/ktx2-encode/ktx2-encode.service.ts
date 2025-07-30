import appRootPath from 'app-root-path'
import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'

import { fileBrowserPath } from '@ir-engine/common/src/schemas/media/file-browser.schema'
import type { KTX2EncodeArguments } from '@ir-engine/engine/src/assets/constants/CompressionParms'

import { Application } from '../../../declarations'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    'ktx2-encode': {
      create: (data: KTX2EncodeArguments) => Promise<string | string[]>
    }
  }
}

const createKtx2 =
  (app: Application) =>
  async (data: KTX2EncodeArguments): Promise<string | string[]> => {
    const projectDir = path.join(appRootPath.path, 'packages/projects')
    const BASIS_U = path.join(appRootPath.path, 'packages/server/public/loader_decoders/basisu')
    const inURI = /.*(projects\/.*)$/.exec(data.src as string)![1]
    const inPath = path.join(projectDir, inURI)
    const fileData = fs.statSync(inPath)
    const isDir = fileData.isDirectory()
    const project = inURI.split('/')[1]

    async function doEncode(inPath) {
      const outPath = inPath.replace(/\.[^\.]+$/, '.ktx2')
      const outURIDir = path.dirname(inURI)
      const projectRelativeDirectoryPath = outURIDir.split('/').slice(2).join('/')
      const fileName = /[^\\/]*$/.exec(outPath)![0]
      const args = `-ktx2${data.mode === 'UASTC' ? ' -uastc' : ''}${data.mipmaps ? ' -mipmap' : ''}${
        data.flipY ? ' -y_flip' : ''
      }${data.srgb ? ' -linear' : ''} -q ${data.quality} ${inPath}`
      console.log(args)
      console.log(execFileSync(BASIS_U, args.split(/\s+/)))
      console.log(execFileSync('mv', [fileName, outPath]))
      const result = await app.service(fileBrowserPath).patch(null, {
        // fileName,
        // path: outURIDir,
        project,
        path: projectRelativeDirectoryPath + '/' + fileName,
        body: fs.readFileSync(outPath),
        contentType: 'image/ktx2'
      })
      return result.url
    }
    if (isDir) {
      const files = fs
        .readdirSync(inPath)
        .filter((file) => file && ['.jpg', '.jpeg', '.png'].some((ending) => file.endsWith(ending)))
        .map((file) => path.join(inPath, file))
      return await Promise.all(files.map(doEncode))
    } else return await doEncode(inPath)
  }

export default (app: Application): any => {
  app.use('ktx2-encode', {
    create: createKtx2(app)
  })
}
