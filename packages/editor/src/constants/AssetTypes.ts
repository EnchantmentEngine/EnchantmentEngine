import { AssetExt } from '@ir-engine/spatial/src/resources/AssetType'
import { NativeTypes } from 'react-dnd-html5-backend'

export type SceneElementType = {
  componentJsonID: string
  label: string
  Icon: JSX.Element
  type: typeof ItemTypes.Component
}

export type DnDFileType = {
  dataTransfer: DataTransfer
  files: File[]
  items: DataTransferItemList
}

export type FileDataType = {
  key: string
  path: string
  name: string
  fullName: string
  size?: string
  thumbnailURL?: string
  url: string
  type: string
  isFolder: boolean
}

/**
 * ItemTypes object containing types of items used.
 */
export const ItemTypes = {
  File: NativeTypes.FILE,
  Folder: 'folder',
  Audios: [AssetExt.MP3, 'mpeg', 'audio/mpeg'],
  Images: [AssetExt.PNG, AssetExt.JPEG, 'jpg', 'gif', AssetExt.KTX2, 'image/png', 'image/jpeg', 'image/ktx2'],
  Models: [AssetExt.GLB, 'model/glb', AssetExt.GLTF, 'model/gltf', AssetExt.VRM, 'model/vrm'],
  Scripts: ['tsx', 'ts', 'jsx', 'js', 'script'],
  Videos: [AssetExt.MP4, AssetExt.M3U8, 'video/mp4', AssetExt.MKV],
  Volumetrics: ['manifest'],
  Text: ['text', 'txt'],
  ECS: ['scene.json'],
  Node: 'Node',
  Material: 'Material',
  Lookdev: 'Lookdev',
  Prefab: 'Prefab',
  Component: 'Component'
}

export const SupportedFileTypes = [
  ...ItemTypes.Images,
  ...ItemTypes.Audios,
  ...ItemTypes.Videos,
  ...ItemTypes.Volumetrics,
  ...ItemTypes.Models,
  ...ItemTypes.Scripts,
  ItemTypes.Folder,
  ItemTypes.File
]
