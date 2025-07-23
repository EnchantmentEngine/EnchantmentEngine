

import { BufferGeometry, Loader, LoadingManager } from 'three'

export class CORTOLoader {
  constructor()
  setDecoderPath(path: string): CORTOLoader
  load(
    url: string,
    byteStart: number,
    byteEnd: number,
    onLoad: (geometry: BufferGeometry | null) => void,
  ): void
  preload(): Promise<void>
  dispose(): CORTOLoader
}
