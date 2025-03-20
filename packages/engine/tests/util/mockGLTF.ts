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

import {
  BINARY_EXTENSION_HEADER_LENGTH,
  BINARY_EXTENSION_HEADER_MAGIC
} from '../../src/assets/loaders/gltf/GLTFExtensions'

type MockGLBOptions = {
  magic?: string
  version?: number
  json?: object
  bin?: ArrayBuffer
}

/** @todo */
function mockGLBLength(args: MockGLBOptions): number {
  expect(args.json).toBeTruthy()
  expect(args.bin).toBeTruthy()
  const json = 4 + 4 + JSON.stringify(args.json).length
  const bin = 4 + 4 + (args.bin?.byteLength ?? 0)
  return BINARY_EXTENSION_HEADER_LENGTH + json + bin
}

/** @todo */
function mockGLBHeader(glb: Uint8Array, args: MockGLBOptions) {
  if (!args.magic) args.magic = BINARY_EXTENSION_HEADER_MAGIC
  expect(args.magic.length).toBe(4)

  const u32 = '\0\0\0\0'
  const data = new TextEncoder().encode(BINARY_EXTENSION_HEADER_MAGIC + u32 + u32)
  const view = new DataView(glb.buffer)
}

/** @todo */
function mockGLBChunkJSON(glb: Uint8Array, args: MockGLBOptions) {}
function mockGLBChunkBIN(glb: Uint8Array, args: MockGLBOptions) {}

/** @todo */
export function mockGLB(args: MockGLBOptions) {
  const result = new Uint8Array(mockGLBLength(args))
  mockGLBHeader(result, args)
  mockGLBChunkJSON(result, args)
  mockGLBChunkBIN(result, args)
  return result
}
