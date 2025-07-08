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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useState } from 'react'
import { FileBrowserInput, getThumbnailFromValue, useThumbnailFromValue } from './index'

/**
 * Example component demonstrating how to get thumbnails from file values
 */
export const FileBrowserThumbnailExample = () => {
  const [fileValue, setFileValue] = useState('')
  const [manualThumbnail, setManualThumbnail] = useState<string | null>(null)

  // Method 1: Using the hook (recommended for React components)
  const { thumbnailURL, loading } = useThumbnailFromValue(fileValue)

  // Method 2: Using the utility function directly
  const handleGetThumbnailManually = async () => {
    if (fileValue) {
      const thumbnail = await getThumbnailFromValue(fileValue)
      setManualThumbnail(thumbnail)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">FileBrowser Thumbnail Example</h2>

      <div>
        <label className="mb-2 block text-sm font-medium">File URL/Path:</label>
        <FileBrowserInput
          value={fileValue}
          onRelease={setFileValue}
          acceptFileTypes={['image/*', 'video/*', 'model/*']}
          acceptDropItems={['image', 'video', 'model']}
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="mb-2 text-lg font-semibold">Method 1: Using Hook (Automatic)</h3>
        {loading && <p className="text-gray-500">Loading thumbnail...</p>}
        {thumbnailURL && (
          <div className="flex items-center gap-4">
            <img src={thumbnailURL} alt="Thumbnail" className="h-24 w-24 rounded border object-cover" />
            <div>
              <p className="text-sm font-medium">Thumbnail URL:</p>
              <p className="break-all text-xs text-gray-600">{thumbnailURL}</p>
            </div>
          </div>
        )}
        {!loading && !thumbnailURL && fileValue && (
          <p className="text-gray-500">No thumbnail available for this file</p>
        )}
      </div>

      <div className="border-t pt-4">
        <h3 className="mb-2 text-lg font-semibold">Method 2: Manual Function Call</h3>
        <button
          onClick={handleGetThumbnailManually}
          disabled={!fileValue}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-300"
        >
          Get Thumbnail Manually
        </button>
        {manualThumbnail && (
          <div className="mt-2 flex items-center gap-4">
            <img src={manualThumbnail} alt="Manual thumbnail" className="h-24 w-24 rounded border object-cover" />
            <div>
              <p className="text-sm font-medium">Manual Thumbnail URL:</p>
              <p className="break-all text-xs text-gray-600">{manualThumbnail}</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <h3 className="mb-2 text-lg font-semibold">Usage Examples</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Hook Usage:</strong>
          </p>
          <pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs">
            {`const { thumbnailURL, loading } = useThumbnailFromValue(fileValue)`}
          </pre>

          <p>
            <strong>Function Usage:</strong>
          </p>
          <pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs">
            {`const thumbnail = await getThumbnailFromValue(fileValue)`}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default FileBrowserThumbnailExample
