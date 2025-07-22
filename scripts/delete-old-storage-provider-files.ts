/* eslint-disable @typescript-eslint/no-var-requires */

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
    let filesToPruneResponse = await storageProvider.getObject('client/StorageProviderFilesToRemoveFinal.json')
    let filesToPrune = JSON.parse(filesToPruneResponse.Body.toString('utf-8'))
    while (filesToPrune.length > 0) {
      const toDelete = filesToPrune.splice(0, 1000)
      await storageProvider.deleteResources(toDelete)
    }
    console.log('Deleted old storage provider files')
    process.exit(0)
  } catch (err) {
    console.log('Error in deleting old storage provider client files:')
    console.log(err)
    cli.fatal(err)
  }
})
