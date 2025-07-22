import { DefaultLoadingManager, LoadingManager } from 'three'

interface Load<TData, TUrl> {
  load: (
    url: TUrl,
    onLoad: (data: TData) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
    signal?: AbortSignal
  ) => void
}

class Loader<TData = unknown, TUrl = string> implements Load<TData, TUrl> {
  static DEFAULT_MATERIAL_NAME = '__DEFAULT'

  manager: LoadingManager
  crossOrigin: string
  withCredentials: boolean
  path: string
  resourcePath: string
  requestHeader: { [header: string]: string }

  constructor(manager?: LoadingManager) {
    this.manager = manager !== undefined ? manager : DefaultLoadingManager

    this.crossOrigin = 'anonymous'
    this.withCredentials = false
    this.path = ''
    this.resourcePath = ''
    this.requestHeader = {}
  }

  load(
    url: TUrl,
    onLoad: (data: TData) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
    signal?: AbortSignal
  ) {}

  loadAsync(url: TUrl, onProgress?: (event: ProgressEvent) => void): Promise<TData> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const scope = this

    return new Promise(function (resolve, reject) {
      scope.load(url, resolve, onProgress, reject)
    })
  }

  parse(data, path, onLoad, onError, url = '') {}

  setCrossOrigin(crossOrigin: string): this {
    this.crossOrigin = crossOrigin
    return this
  }

  setWithCredentials(value: boolean): this {
    this.withCredentials = value
    return this
  }

  setPath(path: string): this {
    this.path = path
    return this
  }

  setResourcePath(resourcePath: string): this {
    this.resourcePath = resourcePath
    return this
  }

  setRequestHeader(requestHeader: { [header: string]: string }): this {
    this.requestHeader = requestHeader
    return this
  }
}

export { Loader }
