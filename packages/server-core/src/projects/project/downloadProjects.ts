import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { deleteFolderRecursive, writeFileSyncRecursive } from '@ir-engine/common/src/utils/fsHelperFunctions'

import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { getFileKeysRecursive } from '../../media/storageprovider/storageProviderUtils'
import logger from '../../ServerLogger'

/**
 * Downloads a specific project to the local file system from the storage provider cache
 * Then runs `npm install --legacy-peer-deps` inside the project to install it's dependencies
 * @param projectName
 * @param storageProviderName
 * @returns {Promise<boolean>}
 */
export const download = async (projectName: string, storageProviderName?: string) => {
  if (projectName === 'enchantmentengine/default-project') return

  const storageProvider = getStorageProvider(storageProviderName)
  try {
    logger.info(`[ProjectLoader]: Installing project "${projectName}"...`)
    let files = await getFileKeysRecursive(`projects/${projectName}/`)

    files = files.filter(
      (file) =>
        !file.startsWith(`/projects/${projectName}/assets/`) && !file.startsWith(`/projects/${projectName}/public/`)
    )
    logger.info('[ProjectLoader]: Found files:' + files)

    const localProjectDirectory = path.join(appRootPath.path, 'packages/projects/projects', projectName)
    if (fs.existsSync(localProjectDirectory)) {
      logger.info('[Project temp debug]: fs exists, deleting')
      deleteFolderRecursive(localProjectDirectory)
    }

    await Promise.all(
      files.map(async (filePath) => {
        logger.info(`[ProjectLoader]: - downloading "${filePath}"`)
        const fileResult = await storageProvider.getObject(filePath)
        if (fileResult.Body.length === 0) {
          logger.info(`[ProjectLoader]: WARNING file "${filePath}" is empty`)
          if (filePath[filePath.length - 1] === '/') return
        }
        writeFileSyncRecursive(path.join(appRootPath.path, 'packages/projects', filePath), fileResult.Body)
      })
    )

    logger.info(`[ProjectLoader]: Successfully downloaded and mounted project "${projectName}".`)
    // if (projectName !== 'enchantmentengine/default-project') {
    //   const npmInstallPromise = new Promise<void>((resolve) => {
    //     const npmInstallProcess = spawn('npm', ['install', '--legacy-peer-deps'], { cwd: localProjectDirectory })
    //     npmInstallProcess.once('exit', () => {
    //       logger.info('Finished npm installing %s', projectName)
    //       resolve()
    //     })
    //     npmInstallProcess.once('error', resolve)
    //     npmInstallProcess.once('disconnect', resolve)
    //     npmInstallProcess.stdout.on('data', (data) => logger.info(data.toString()))
    //     npmInstallProcess.stderr.on('data', (data) => logger.error(data.toString()))
    //   }).then((result) => logger.info(result))
    //   await Promise.race([
    //     npmInstallPromise,
    //     new Promise<void>((resolve) => {
    //       setTimeout(() => {
    //         logger.warn(`WARNING: npm installing ${projectName} took too long!`)
    //         resolve()
    //       }, 5 * 60 * 1000) // timeout after 5 minutes
    //     })
    //   ])
    // }
  } catch (e) {
    const errorMsg = `[ProjectLoader]: Failed to download project ${projectName} with error: ${e.message}`
    logger.error(e, errorMsg)
    throw e
  }
}
