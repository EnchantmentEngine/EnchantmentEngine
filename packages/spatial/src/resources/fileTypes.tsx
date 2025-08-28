import { AssetExt } from './AssetType'

// array containing audio file type
export const AudioFileTypes = ['.mp3', '.mpeg', 'audio/mpeg', '.ogg']
//array containing video file type
export const VideoFileTypes = ['.mp4', 'video/mp4', '.m3u8', 'application/vnd.apple.mpegurl']
//array containing image files types
export const ImageFileTypes = [
  '.png',
  '.jpeg',
  '.jpg',
  '.gif',
  '.ktx2',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/ktx2'
]
//array containing model file type.
export const ModelFileTypes = ['.glb', '.gltf', 'model/gltf-binary', 'model/gltf+json', '.vrm']
//array containing volumetric file type.
export const VolumetricFileTypes = ['.manifest']
//array containing custom script type.
export const CustomScriptFileTypes = ['.tsx', '.ts', '.js', '.jsx']
export const BinaryFileTypes = ['.bin']
//array contains arrays of all files types.
export const AllFileTypes = [
  ...AudioFileTypes,
  ...VideoFileTypes,
  ...ImageFileTypes,
  ...ModelFileTypes,
  ...VolumetricFileTypes,
  ...CustomScriptFileTypes,
  ...BinaryFileTypes
]

//creating comma separated string contains all file types
export const AcceptsAllFileTypes = AllFileTypes.join(',')

export const MimeTypeToAssetType = {
  'audio/mpeg': AssetExt.MP3,
  'video/mp4': AssetExt.MP4,
  'image/png': AssetExt.PNG,
  'image/jpeg': AssetExt.JPEG,
  'image/ktx2': AssetExt.KTX2,
  'model/gltf-binary': AssetExt.GLB,
  'model/gltf+json': AssetExt.GLTF,
  'model/vrm': AssetExt.VRM,
  'model/vrml': AssetExt.VRM
} as Record<string, AssetExt>

export const AssetTypeToMimeType = {
  [AssetExt.MP3]: 'audio/mpeg',
  [AssetExt.MP4]: 'video/mp4',
  [AssetExt.PNG]: 'image/png',
  [AssetExt.JPEG]: 'image/jpeg',
  [AssetExt.KTX2]: 'image/ktx2',
  [AssetExt.GLB]: 'model/gltf-binary',
  [AssetExt.GLTF]: 'model/gltf+json'
} as Record<AssetExt, string>

export const ExtensionToAssetType = {
  gltf: AssetExt.GLTF,
  glb: AssetExt.GLB,
  vrm: AssetExt.VRM,
  tga: AssetExt.TGA,
  ktx2: AssetExt.KTX2,
  ddx: AssetExt.DDS,
  png: AssetExt.PNG,
  jpg: AssetExt.JPEG,
  jpeg: AssetExt.JPEG,
  mp3: AssetExt.MP3,
  aac: AssetExt.AAC,
  ogg: AssetExt.OGG,
  m4a: AssetExt.M4A,
  mp4: AssetExt.MP4,
  mkv: AssetExt.MKV,
  m3u8: AssetExt.M3U8,
  material: AssetExt.MAT
}
