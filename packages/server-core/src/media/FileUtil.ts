import fs from 'fs'
import path from 'path'

import { StorageProviderInterface } from './storageprovider/storageprovider.interface'

export const copyRecursiveSync = function (src: string, dest: string): void {
  if (!fs.existsSync(src)) return

  if (fs.lstatSync(src).isDirectory()) {
    fs.mkdirSync(dest)
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

export const getIncrementalName = async function (
  name: string,
  directoryPath: string,
  store: StorageProviderInterface,
  isDirectory?: boolean
): Promise<string> {
  let filename = name

  if (!isDirectory && !(await store.doesExist(filename, directoryPath))) return filename
  if (isDirectory && !(await store.isDirectory(filename, directoryPath))) return filename

  let count = 1

  if (isDirectory) {
    while (await store.isDirectory(filename, directoryPath)) {
      filename = `${name}_${count}`
      count++
    }
  } else {
    const extension = path.extname(name)
    const baseName = path.basename(name, extension)

    while (await store.doesExist(filename, directoryPath)) {
      filename = `${baseName}_${count}${extension}`
      count++
    }
  }

  return filename
}

export const isValidFileType = function (fileType: string, fileName: string): boolean {
  return (
    fileType === 'application/javascript' ||
    fileType === 'text/javascript' ||
    fileType === 'application/x-typescript' ||
    fileType === 'text/typescript' ||
    fileType.startsWith('image/') ||
    fileType.startsWith('audio/') ||
    fileType.startsWith('video/') ||
    fileType.startsWith('model/') ||
    (fileType === 'application/octet-stream' &&
      (fileName.endsWith('.ktx2') ||
        fileName.endsWith('.gltf') ||
        fileName.endsWith('.glb') ||
        fileName.endsWith('.bin') ||
        fileName.endsWith('.tsx') ||
        fileName.endsWith('.ts') ||
        fileName.endsWith('.jsx') ||
        fileName.endsWith('.js'))) ||
    (fileType === 'application/macbinary' && fileName.endsWith('.bin')) // Mac changes the mimetype to this when using browser document upload.
  )
}
