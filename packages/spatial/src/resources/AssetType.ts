
/** List of Asset Types. */
export const AssetType = {
  Model: 'Model',
  Material: 'Material',
  Image: 'Image',
  Video: 'Video',
  Audio: 'Audio',
  Prefab: 'Prefab',
  Lookdev: 'Lookdev',
  Volumetric: 'Volumetric',
  Unknown: 'unknown'
} as const

export type AssetType = (typeof AssetType)[keyof typeof AssetType]

/** List of Asset Extensions. */
export const AssetExt = {
  GLB: 'glb',
  GLTF: 'gltf',
  VRM: 'vrm',
  BIN: 'bin',

  PNG: 'png',
  JPEG: 'jpeg',
  TGA: 'tga',
  KTX2: 'ktx2',
  DDS: 'dds',
  WEBP: 'webp',
  GIF: 'gif',

  MP4: 'mp4',
  AVI: 'avi',
  WEBM: 'webm',
  MKV: 'mkv',
  MOV: 'mov',
  M3U8: 'm3u8',
  MPD: 'mpd',

  MP3: 'mp3',
  WAV: 'wav',
  OGG: 'ogg',
  M4A: 'm4a',
  FLAC: 'flac',
  AAC: 'acc',

  MAT: 'material',

  UVOL: 'uvol',
  JSON: 'json'
} as const

export type AssetExt = (typeof AssetExt)[keyof typeof AssetExt]

export const AssetExtToAssetType = (assetExt: AssetExt | undefined): AssetType => {
  switch (assetExt) {
    // Model
    case AssetExt.GLB:
    case AssetExt.GLTF:
    case AssetExt.VRM:
      return AssetType.Model

    // Image
    case AssetExt.PNG:
    case AssetExt.JPEG:
    case AssetExt.TGA:
    case AssetExt.KTX2:
    case AssetExt.GIF:
    case AssetExt.DDS:
      return AssetType.Image

    // Video
    case AssetExt.MP4:
    case AssetExt.AVI:
    case AssetExt.WEBM:
    case AssetExt.MKV:
    case AssetExt.MOV:
    case AssetExt.M3U8:
    case AssetExt.MPD:
      return AssetType.Video

    // Audio
    case AssetExt.MP3:
    case AssetExt.WAV:
    case AssetExt.OGG:
    case AssetExt.M4A:
    case AssetExt.FLAC:
    case AssetExt.AAC:
      return AssetType.Audio

    // Material
    case AssetExt.MAT:
      return AssetType.Material

    // Volumetric
    case AssetExt.JSON:
    case AssetExt.UVOL:
      return AssetType.Volumetric

    default:
      return AssetType.Unknown
  }
}

export const FileExtToAssetExt = (fileExt: string): AssetExt | undefined => {
  fileExt = fileExt.toLowerCase()
  if (fileExt === 'jpg') return AssetExt.JPEG
  return fileExt as AssetExt
}

const dataURLStart = 'data:image'

/**
 * Get asset type from the asset file extension.
 * @param file Name of the Asset file.
 * @returns Asset type of the file.
 */
export const FileToAssetExt = (file: string): AssetExt | undefined => {
  if (isURL(file)) {
    const url = new URL(file)
    file = url.pathname.split('/').pop() as string
  }
  // Check if image data url
  else if (file.startsWith(dataURLStart)) {
    return file.startsWith('/png', dataURLStart.length) ? AssetExt.PNG : AssetExt.JPEG
  }
  const ext = file.split('.').pop()
  return ext ? FileExtToAssetExt(ext) : undefined
}

export const FileToAssetExtAndType = (file: string): [AssetExt | undefined, AssetType] => {
  return [FileToAssetExt(file), FileToAssetType(file)]
}

/**
 * Get asset class from the asset file extension.
 * @param fileName Name of the Asset file.
 * @returns Asset class of the file.
 */
export const FileToAssetType = (fileName: string): AssetType => {
  if (!fileName || fileName === '') {
    return AssetType.Unknown
  }

  if (isURL(fileName)) {
    const url = new URL(fileName)
    fileName = url.pathname.split('/').pop() as string
  }

  const split = fileName.split('.')
  const ext = split.pop()?.toLowerCase()

  if (!ext) return AssetType.Unknown
  if (ext === 'gltf') {
    const prev = split.pop()
    if (prev) {
      if (prev === 'material') return AssetType.Material
      else if (prev === 'lookdev') return AssetType.Lookdev
      else if (prev === 'prefab') return AssetType.Prefab
    }
  }

  return AssetExtToAssetType(FileExtToAssetExt(ext))
}

export function isURL(path: string) {
  if (!path || path === '') return false
  return path.startsWith('http://') || path.startsWith('https://') || path.startsWith('file://')
}
