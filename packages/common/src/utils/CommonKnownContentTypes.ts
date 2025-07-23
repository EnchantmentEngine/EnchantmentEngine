/**
 * CommonKnownContentTypes object containing common content types.
 *
 * @type {Object}
 */
export const CommonKnownContentTypes = {
  material: 'model/material',
  prefab: 'model/prefab',
  lookdev: 'model/lookdev',
  xre: 'prefab/xre',
  gltf: 'model/gltf',
  glb: 'model/gltf-binary',
  vrm: 'model/vrm',
  png: 'image/png',
  ktx2: 'image/ktx2',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  pdf: 'application/pdf',
  m3u8: 'application/vnd.apple.mpegurl',
  mp4: 'video/mp4',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  mp3: 'audio/mpeg',
  tsx: 'application/octet-stream',
  ts: 'application/octet-stream',
  js: 'application/octet-stream',
  json: 'application/json',
  bin: 'application/octet-stream'
}

export const MimeTypeToExtension = {
  'prefab/xre': 'xre',
  'model/material': 'material',
  'model/gltf': 'gltf',
  'model/gltf-binary': 'glb',
  'model/vrm': 'vrm',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/ktx2': 'ktx2',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/vnd.apple.mpegurl': 'm3u8',
  'video/mp4': 'mp4',
  'video/x-matroska': 'mkv',
  'video/x-msvideo': 'avi',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/ogg': 'ogg'
}
