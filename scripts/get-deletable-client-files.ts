/* eslint-disable @typescript-eslint/no-var-requires */

import { UNIQUEIFIED_VITE_KEY_REGEX } from '@ir-engine/common/src/regex'
import cli from 'cli'

import {
  createDefaultStorageProvider,
  getStorageProvider
} from '@ir-engine/server-core/src/media/storageprovider/storageprovider'

cli.enable('status')

cli.main(async () => {
  try {
    await createDefaultStorageProvider()
    const storageProvider = getStorageProvider()
    let files = await storageProvider.listFolderContent('client/assets', true)
    files = files.filter((file) => UNIQUEIFIED_VITE_KEY_REGEX.test(file.key))
    const putData = {
      Body: Buffer.from(JSON.stringify(files.map((file) => file.key))),
      ContentType: 'application/json',
      Key: 'client/StorageProviderFilesToRemoveInitial.json'
    }
    await storageProvider.putObject(putData, { isDirectory: false })
    console.log('Created list of client files to delete after deployment')
    process.exit(0)
  } catch (err) {
    console.log('Error in getting deletable client files:')
    console.log(err)
    cli.fatal(err)
  }
})
