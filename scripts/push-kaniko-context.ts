/* eslint-disable @typescript-eslint/no-var-requires */

import cli from 'cli'
import fs from 'fs'

import {
  createDefaultStorageProvider,
  getStorageProvider
} from '@ir-engine/server-core/src/media/storageprovider/storageprovider'
import { getContentType } from '@ir-engine/server-core/src/util/fileUtils'

cli.enable('status')

const options = cli.parse({
  startTime: [false, 'Builder start time', 'string']
})

cli.main(async () => {
  try {
    await createDefaultStorageProvider()
    const storageProvider = getStorageProvider()
    storageProvider.bucket = process.env.KANIKO_CONTEXT_REPO
    const contextFile = fs.readFileSync(`/builder-context-${options.startTime}.tar.gz`)
    let contentType = getContentType(contextFile)
    let putData: any = {
      Body: contextFile,
      ContentType: contentType,
      Key: `builder-context-${options.startTime}.tar.gz`,
      Metadata: {
        'Cache-Control': 'no-cache'
      }
    } as any
    await storageProvider.putObject(putData, { isDirectory: false })
    console.log('Pushed kaniko build context to Storage Provider')
    process.exit(0)
  } catch (err) {
    console.log('Error in pushing client images to Storage Provider:')
    console.log(err)
    cli.fatal(err)
  }
})
