/* eslint-disable @typescript-eslint/no-var-requires */

import appRootPath from 'app-root-path'
import cli from 'cli'
import fs from 'fs'
import path from 'path'

import { cleanFileNameString } from '@ir-engine/common/src/utils/cleanFileName'
import { getFilesRecursive } from '@ir-engine/common/src/utils/fsHelperFunctions'
import logger from '@ir-engine/server-core/src/ServerLogger'
import {
  createDefaultStorageProvider,
  getStorageProvider
} from '@ir-engine/server-core/src/media/storageprovider/storageprovider'
import { getContentType } from '@ir-engine/server-core/src/util/fileUtils'

cli.enable('status')

cli.main(async () => {
  try {
    await createDefaultStorageProvider()
    const storageProvider = getStorageProvider()
    const clientPath = path.resolve(appRootPath.path, `packages/client/dist`)
    const files = getFilesRecursive(clientPath)
    let filesToPruneResponse = await storageProvider.getObject('client/StorageProviderFilesToRemoveInitial.json')
    const filesToPush: string[] = []
    await Promise.all(
      files.map((file) => {
        return new Promise(async (resolve) => {
          try {
            const fileResult = fs.readFileSync(file)
            let filePathRelative = cleanFileNameString(file.slice(clientPath.length), true)
            let contentType = getContentType(file)
            const putData: any = {
              Body: fileResult,
              ContentType: contentType,
              Key: path.join('client', filePathRelative),
              Metadata: {
                'Cache-Control': 'no-cache'
              }
            } as any
            if (/.br$/.exec(filePathRelative)) {
              filePathRelative = filePathRelative.replace(/.br$/, '')
              putData.ContentType = getContentType(filePathRelative)
              putData.ContentEncoding = 'br'
              putData.Key = path.join('client', filePathRelative)
              putData.Metadata = {
                'Cache-Control': 'no-cache'
              }
            }
            await storageProvider.putObject(putData, { isDirectory: false })
            filesToPush.push(path.join('client', filePathRelative))
            resolve(null)
          } catch (e) {
            logger.error(e)
            resolve(null)
          }
        })
      })
    )
    console.log('Pushed client files to Storage Provider')
    let filesToPrune = JSON.parse(filesToPruneResponse.Body.toString('utf-8'))
    filesToPrune = filesToPrune.filter((file) => filesToPush.indexOf(file) < 0)
    const putData = {
      Body: Buffer.from(JSON.stringify(filesToPrune)),
      ContentType: 'application/json',
      Key: 'client/StorageProviderFilesToRemoveFinal.json',
      Metadata: {
        'Cache-Control': 'no-cache'
      }
    }
    await storageProvider.putObject(putData, { isDirectory: false })
    await storageProvider.createInvalidation(['client/*'])
    console.log('Pushed filtered list of files to remove to Storage Provider')
    process.exit(0)
  } catch (err) {
    console.log('Error in pushing client images to Storage Provider:')
    console.log(err)
    cli.fatal(err)
  }
})
