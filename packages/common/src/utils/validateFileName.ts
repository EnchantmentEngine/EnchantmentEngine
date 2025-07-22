import {
  PATH_REGEX,
  VALID_EXTENSION_REGEX,
  VALID_FILENAME_REGEX,
  WINDOWS_RESERVED_NAME_REGEX
} from '@ir-engine/common/src/regex'

export function isValidFileName(fileName: string): { isValid: boolean; error?: string } {
  if (!VALID_FILENAME_REGEX.test(fileName)) {
    return {
      isValid: false,
      error: `Invalid name: ${fileName}; file or folder names must be 4-64 characters, start and end with an alphanumeric, and contain only alphanumerics, dashes, underscores, and dots.`
    }
  }

  if (WINDOWS_RESERVED_NAME_REGEX.test(fileName)) {
    return {
      isValid: false,
      error: 'Name cannot be a Windows reserved name'
    }
  }

  return { isValid: true }
}

export function isValidFilePath(path: string): { isValid: boolean; error?: string } {
  if (!PATH_REGEX.test(path)) {
    return {
      isValid: false,
      error: `Invalid path: ${path}; directories can only contain alphanumeric characters, dashes, underscores, dots, and @`
    }
  }
  return { isValid: true }
}

export function isValidFileExtension(extension: string): { isValid: boolean; error?: string } {
  if (!VALID_EXTENSION_REGEX.test(extension)) {
    return {
      isValid: false,
      error: `Invalid file extension: ${extension}; file extension must be 2-4 alphanumeric characters`
    }
  }
  return { isValid: true }
}
