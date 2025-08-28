export type ResourceType = {
  type: string // 'scene' | 'asset' | 'file' | 'thumbnail' | 'avatar' | 'recording'
  tags?: string[]
  dependencies?: string[] // other keys
  licensing?: string
  description?: string
  name?: string
  attribution?: string
  thumbnailKey?: string
  thumbnailMode?: string // 'automatic' | 'manual'
  width?: number
  height?: number
  depth?: number
}

// key = /path/to/file.ext
export type ResourcesJson = Record<string, ResourceType>
