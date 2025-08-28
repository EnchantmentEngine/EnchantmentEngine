import ffmpeg from './ffmpeg/ffmpeg'
import FileBrowserUpload from './file-browser-upload/file-browser-upload'
import FileBrowser from './file-browser/file-browser'
import Invalidation from './invalidation/invalidation'
import OEmbed from './oembed/oembed'
import Archiver from './recursive-archiver/archiver'
import StaticResourceSearch from './static-resource-search/static-resource-search'
import StaticResourceTag from './static-resource-tag/static-resource-tag'
import StaticResourceVector from './static-resource-vector/static-resource-vector'
import StaticResource from './static-resource/static-resource'
import Upload from './upload-asset/upload-asset.service'

export default [
  Invalidation,
  StaticResource,
  StaticResourceTag,
  StaticResourceVector,
  StaticResourceSearch,
  FileBrowser,
  FileBrowserUpload,
  OEmbed,
  Upload,
  Archiver,
  ffmpeg
]
