/* eslint-disable @typescript-eslint/no-var-requires */

import {
  createDefaultStorageProvider,
  getStorageProvider
} from '@ir-engine/server-core/src/media/storageprovider/storageprovider'
import cli from 'cli'

cli.enable('status')

cli.main(async () => {
  try {
    await createDefaultStorageProvider()
    const storageProvider = getStorageProvider()
    storageProvider.bucket = process.env.KANIKO_CONTEXT_REPO

    const filesResponse = await storageProvider.provider.bucket(storageProvider.bucket).getFiles({
      delimiter: '/'
    })
    const files = filesResponse[2].items

    const sorted = files.sort((a, b) => new Date(b.createdAt || b.timeCreated) - new Date(a.createdAt || a.timeCreated))
    const toDelete = sorted.slice(5).map((item) => item.name)
    if (toDelete.length > 0) await storageProvider.deleteResources(toDelete)

    console.log('Pruned old Kaniko build contexts')
    process.exit(0)
  } catch (err) {
    console.log('Error in pruning Kaniko build contexts:')
    console.log(err)
    cli.fatal(err)
  }
})
