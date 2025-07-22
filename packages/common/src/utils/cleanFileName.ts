import mime from 'mime-types'

/**
 * This method takes a filename (with or without included path) and returns a cleaned version of it.
 * Ensures toLower file extension, truncates a file name if too long, and sanitizes special characters
 * @param fullFileName
 * @param useStorageProviderLengthRestrictions
 */
export const cleanFileNameString = (fullFileName: string, useStorageProviderLengthRestrictions = false): string => {
  try {
    //extract the path and file name separately
    const lastSlashIndex = fullFileName.lastIndexOf('/')
    const filePath = fullFileName.substring(0, lastSlashIndex)
    const fileName = fullFileName.substring(lastSlashIndex + 1)

    // Find the last period in the filename (the start of the extension)
    const _lastDotIndex = fileName.lastIndexOf('.')
    const hasExtension = _lastDotIndex !== -1
    const lastDotIndex = hasExtension ? _lastDotIndex : fileName.length

    // Split the name into the part before and after the dot
    let nameWithoutExtension = fileName.substring(0, lastDotIndex)
    const extension = fileName.substring(lastDotIndex + 1).toLowerCase()

    //Used by backend uploads to storage provider...
    if (useStorageProviderLengthRestrictions) {
      if (nameWithoutExtension.length > 1024) nameWithoutExtension = nameWithoutExtension.slice(0, 1024)
    } else {
      // Truncate or concat the name if it is too long or too short
      if (nameWithoutExtension.length > 64) {
        nameWithoutExtension = nameWithoutExtension.slice(0, 64)
      } else if (nameWithoutExtension.length < 4) {
        nameWithoutExtension = nameWithoutExtension.padEnd(4, '0')
      }
    }

    // Combine the name with the lowercase extension
    const newFileName = hasExtension ? `${nameWithoutExtension}.${extension}` : `${nameWithoutExtension}`
    return filePath ? filePath + '/' + newFileName : newFileName
  } catch (e) {
    return fullFileName
  }
}

/**
 * Returns a new File object with the same properties as the input file,
 * but with the extension in lowercase and filename truncated if it is too long.
 * @param file
 */
export function cleanFileNameFile(file: File): File {
  // Ensure File object contains correct mimetype.
  const mimeType = mime.lookup(file.name) || 'application/octet-stream'

  const newFile = new File([file], cleanFileNameString(file.name), {
    type: mimeType,
    lastModified: file.lastModified
  })
  //overwrite the webkitRelativePath property to preserve directory structure
  Object.defineProperty(newFile, 'webkitRelativePath', {
    value: file.webkitRelativePath !== '' ? cleanFileNameString(file.webkitRelativePath) : '',
    writable: false,
    enumerable: true,
    configurable: true
  })
  return newFile
}
