import assert from 'assert'
import { describe, it } from 'vitest'
import { cleanFileNameString } from './cleanFileName'

describe('cleanFileNameString', () => {
  it('should return a cleaned version of the filename', () => {
    const fullFileName = 'path/to/file/file_name.txt'
    const result = cleanFileNameString(fullFileName)
    assert.equal(result, 'path/to/file/file_name.txt')
  })

  it('should return a cleaned version of the filename even if it doesnt have and extension', () => {
    const fullFileName = 'path/to/file/file_name'
    const result = cleanFileNameString(fullFileName)
    assert.equal(result, 'path/to/file/file_name')
  })

  it('should return a cleaned version of the filename with a truncated name', () => {
    const fullFileName = 'path/to/file/' + 'a'.repeat(1000) + '.txt'
    const result = cleanFileNameString(fullFileName)
    assert.equal(result, 'path/to/file/' + 'a'.repeat(64) + '.txt')
  })

  it('should respect multiple spaces in the file name', () => {
    const fullFileName = 'path/to/file/file name with spaces.txt'
    const result = cleanFileNameString(fullFileName)
    assert.equal(result, 'path/to/file/file name with spaces.txt')
  })
})
