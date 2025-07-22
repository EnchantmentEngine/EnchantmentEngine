import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { AssetExt, AssetType, FileToAssetExt, FileToAssetType } from './AssetType'

describe('AssetType', () => {
  beforeEach(async () => {})

  afterEach(() => {})

  it('Returns the correct extension enum for urls', () => {
    // Test both extensions for jpg
    const jpg = 'https://localhost:3000/test.jpg?test=123212'
    const jpeg = 'https://localhost:3000/test.jpeg?test=123123'
    const badURl = 'https://localhost:3000/test.'
    const badURl2 = '/path/path/'

    assert(FileToAssetExt(jpg) === AssetExt.JPEG)
    assert(FileToAssetExt(jpeg) === AssetExt.JPEG)
    assert(!FileToAssetExt(badURl))

    const exts = Object.values(AssetExt)

    const badExt = FileToAssetExt(badURl2)
    for (const ext of exts) {
      assert(badExt !== (ext as AssetExt))
    }

    for (const ext of exts) {
      const url = 'https://localhost:3000/test.' + ext
      assert(FileToAssetExt(url) === (ext as AssetExt))
    }

    for (const ext of exts) {
      const url = 'https://localhost:3000/test.' + ext.toUpperCase()
      assert(FileToAssetExt(url) === (ext as AssetExt))
    }

    for (const ext of exts) {
      const url = 'localhost:3000/test.' + ext
      assert(FileToAssetExt(url) === (ext as AssetExt))
    }
  })

  it('Returns the correct type enum for urls', () => {
    const jpg = 'https://localhost:3000/test.jpg?test=123212'
    const jpeg = 'https://localhost:3000/test.jpeg?test=123123'
    const gltf = 'https://localhost:3000/test.gltf?test=123123'
    const gltfMaterial = 'https://localhost:3000/test.material.gltf?test=123123'
    const gltfLookdev = 'https://localhost:3000/test.lookdev.gltf?test=123123'
    const gltfPrefab = 'https://localhost:3000/test.prefab.gltf?test=123123'
    const video = 'https://localhost:3000/test.mp4?test=123123'
    const audio = 'https://localhost:3000/test.mp3?test=123123'
    const uvol = 'https://localhost:3000/test.uvol?test=123123'

    assert(FileToAssetType(jpg) === AssetType.Image)
    assert(FileToAssetType(jpeg) === AssetType.Image)
    assert(FileToAssetType(gltf) === AssetType.Model)
    assert(FileToAssetType(gltfMaterial) === AssetType.Material)
    assert(FileToAssetType(gltfLookdev) === AssetType.Lookdev)
    assert(FileToAssetType(gltfPrefab) === AssetType.Prefab)
    assert(FileToAssetType(video) === AssetType.Video)
    assert(FileToAssetType(audio) === AssetType.Audio)
    assert(FileToAssetType(uvol) === AssetType.Volumetric)
  })
})
