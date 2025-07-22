import { KnexAdapterParams } from '@feathersjs/knex'
import appRootPath from 'app-root-path'
import extract from 'extract-zip'
import fs from 'fs'
import path from 'path'

import { assetLibraryMethods, assetLibraryPath } from '@ir-engine/common/src/schemas/assets/asset-library.schema'

import { Application } from '../../../declarations'
import assetLibraryDocs from './zipper.docs'
import hooks from './zipper.hooks'

const rootPath = path.join(appRootPath.path, 'packages/projects/projects/')

export interface AssetLibraryParams extends KnexAdapterParams {
  path: string
}

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [assetLibraryPath]: {
      create: (createParams: AssetLibraryParams) => Promise<string>
    }
  }
}

export default (app: Application): void => {
  app.use(
    assetLibraryPath,
    {
      create: async (createParams: AssetLibraryParams) => {
        try {
          const inPath = decodeURI(createParams.path)
          const pathData = /.*projects\/([\w\d\s\-_]+)\/assets\/([\w\d\s\-_\\\/]+).zip$/.exec(inPath)
          if (!pathData) throw new Error('could not extract path data')
          const [_, projectName, fileName] = pathData
          const assetRoot = `${projectName}/assets/${fileName}`
          const fullPath = path.join(rootPath, assetRoot)
          fs.mkdirSync(fullPath)
          await extract(`${fullPath}.zip`, { dir: fullPath })
          return assetRoot
        } catch (e) {
          throw new Error('error unzipping archive:', e)
        }
      }
    },
    {
      // A list of all methods this service exposes externally
      methods: assetLibraryMethods,
      // You can add additional custom events to be sent to clients here
      events: [],
      docs: assetLibraryDocs
    }
  )

  const service = app.service(assetLibraryPath)
  service.hooks(hooks)
}
