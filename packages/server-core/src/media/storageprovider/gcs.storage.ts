/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import path from 'path/posix'
import S3BlobStore from 's3-blob-store'

import { FileBrowserContentType } from '@ir-engine/common/src/schemas/media/file-browser.schema'

import config from '../../appconfig'
import {
  PutObjectParams,
  SignedURLResponse,
  StorageListObjectInterface,
  StorageObjectInterface,
  StorageObjectPutInterface,
  StorageProviderInterface
} from './storageprovider.interface'

const { Storage } = require('@google-cloud/storage')

/**
 * Storage provide class to communicate with AWS S3 API.
 */
export class GCSStorage implements StorageProviderInterface {
  constructor() {}
  /**
   * Name of GCS bucket.
   */
  bucket = config.gcp.gcs.bucket

  /**
   * Instance of GCS service object. This object has one method for each API operation.
   */
  provider = new Storage()

  getCacheDomain(internal?: boolean): string {
    return this.cacheDomain
  }

  /**
   * Domain address of S3 cache.
   */
  cacheDomain = config.gcp.gcs.gcurl

  originURLs = [this.cacheDomain]

  /**
   * Get the instance of S3 storage provider.
   */
  getProvider(): StorageProviderInterface {
    return this
  }

  /**
   * Check if an object exists in the GCS storage.
   * @param fileName Name of file in the storage.
   * @param directoryPath Directory of file in the storage.
   */
  async doesExist(fileName: string, directoryPath: string): Promise<boolean> {
    const file = this.provider.bucket(this.bucket).file(`${directoryPath}/${fileName}`)
    const response = file.exists()
    return response[0]
  }
  /**
   * Check if an object is directory or not.
   * @param fileName Name of file in the storage.
   * @param directoryPath Directory of file in the storage.
   */
  async isDirectory(fileName: string, directoryPath: string): Promise<boolean> {
    // Directories in GCS don't exists and are emulated based on file path.
    return false
  }

  /**
   * Get the S3 storage object.
   * @param key Key of object.
   */
  async getObject(key: string): Promise<StorageObjectInterface> {
    const file = this.provider.bucket(this.bucket).file(key)
    const response = file.get()
    const [metadata] = file.getMetadata()
    return { Body: response[0], ContentType: metadata.contentType }
  }

  /**
   * Get the object from cache.
   * @param key Key of object.
   */
  getCachedURL(key: string, internal?: boolean): string {
    return ''
  }

  /**
   * Get the content type of storage object.
   * @param key Key of object.
   */
  async getObjectContentType(key: string): Promise<any> {
    return ''
  }

  /**
   * Get a list of keys under a path.
   * @param prefix Path relative to root in order to list objects.
   * @param recursive If true it will list content from sub folders as well. Default is true.
   * @param continuationToken It indicates that the list is being continued with a token. Used for certain providers like S3.
   * @returns {Promise<StorageListObjectInterface>}
   */
  async listObjects(prefix: string, recursive = true, continuationToken?: string): Promise<StorageListObjectInterface> {
    const files = await this.listFolderContent(prefix, recursive)
    return {
      Contents: files.map((file) => {
        return {
          Key: file.key!,
          Size: file.size!
        }
      })
    }
  }

  /**
   * Adds an object into the S3 storage.
   * @param data Storage object to be added.
   * @param params Parameters of the add request.
   */
  async putObject(data: StorageObjectPutInterface, params: PutObjectParams = {}): Promise<boolean> {
    if (!data.Key) return false
    // key should not contain '/' at the begining
    const key = data.Key[0] === '/' ? data.Key.substring(1) : data.Key

    const file = this.provider.bucket(this.bucket).file(key)

    const args: any = {
      contentType: data.ContentType
    }

    if (data.ContentEncoding) args.contentEncoding = data.ContentEncoding

    if (data.Metadata) args.metadata = data.Metadata

    await file.setMetadata(args)

    try {
      await file.save(data.Body)
      return true
    } catch (err) {
      return false
    }
  }

  async getOriginURLs(): Promise<string[]> {
    return ['']
  }

  createInvalidation = async (): Promise<any> => Promise.resolve()

  associateWithFunction = async (): Promise<any> => Promise.resolve()

  createFunction = async (): Promise<any> => Promise.resolve()

  listFunctions = async (): Promise<any> => Promise.resolve()

  publishFunction = async (): Promise<any> => Promise.resolve()

  updateFunction = async (): Promise<any> => Promise.resolve()

  /**
   * Get the BlobStore object for S3 storage.
   */
  getStorage(): typeof S3BlobStore {
    return this.provider
  }

  /**
   * Get the form fields and target URL for direct POST uploading.
   * @param key Key of object.
   * @param expiresAfter The number of seconds for which signed policy should be valid. Defaults to 3600 (one hour).
   * @param conditions An array of conditions that must be met for the form upload to be accepted by S3.
   */
  async getSignedUrl(key: string, expiresAfter: number, conditions): Promise<SignedURLResponse> {
    // These options will allow temporary read access to the file
    const options = {
      version: 'v4',
      action: 'read',
      expires: expiresAfter
    }

    const result = await this.provider.bucket(this.bucket).file(key).getSignedUrl(options)

    return {
      fields: result.fields,
      cacheDomain: this.cacheDomain,
      url: result.url,
      local: false
    }
  }

  /**
   * Delete resources in the GCS storage.
   * @param keys List of keys.
   */
  async deleteResources(keys: string[]) {
    return await Promise.all(
      keys.map(async (key) => {
        return this.provider.bucket(this.bucket).file(key).delete()
      })
    )
  }

  /**
   * List all the files/folders in the directory.
   * @param folderName Name of folder in the storage.
   * @param recursive If true it will list content from sub folders as well.
   */
  async listFolderContent(folderName: string, recursive = false): Promise<FileBrowserContentType[]> {
    const prefix = folderName.endsWith('/') ? folderName : folderName + '/'
    const files = await this.provider.bucket(this.bucket).getFiles({
      prefix,
      delimiter: recursive ? undefined : '/'
    })
    return files[0].map(({ metadata }) => {
      const { name, mediaLink, size } = metadata
      return {
        key: name,
        url: mediaLink,
        name: name.split('.').shift().replace(prefix, ''),
        type: name.split('.').pop(),
        size: parseInt(size)
      }
    })
  }

  async getFolderSize(folderName: string): Promise<number> {
    const folderContent = await this.listFolderContent(folderName)
    return folderContent.reduce((accumulator, { size }) => accumulator + size!, 0)
  }

  /**
   * Move or copy object from one place to another in the gcs storage.
   * @param oldName Name of the old object.
   * @param newName Name of the new object.
   * @param oldPath Path of the old object.
   * @param newPath Path of the new object.
   * @param isCopy If true it will create a copy of object.
   */
  async moveObject(oldName: string, newName: string, oldPath: string, newPath: string, isCopy = false) {
    const oldFilePath = path.join(oldPath, oldName)
    const newFilePath = path.join(newPath, newName)

    if (isCopy) {
      return await this.provider.bucket(this.bucket).file(oldFilePath).move(newFilePath, {})
    } else {
      return await this.provider.bucket(this.bucket).file(oldFilePath).copy(newFilePath, {})
    }
  }
}

export default GCSStorage
