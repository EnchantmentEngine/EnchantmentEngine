import { Extension, ReaderContext, WriterContext } from '@gltf-transform/core'
import { CopyableExtension } from './CopyableExtension'

const EXTENSION_NAME = 'VRM'

export class VRMExtension extends CopyableExtension {
  public readonly extensionName = EXTENSION_NAME
  public static readonly EXTENSION_NAME = EXTENSION_NAME

  vrm: any | null = null

  public read(readerContext: ReaderContext): this {
    if (readerContext.jsonDoc.json.extensions?.[EXTENSION_NAME]) {
      this.vrm = readerContext.jsonDoc.json.extensions[EXTENSION_NAME]
    }
    return this
  }

  public write(writerContext: WriterContext): this {
    if (this.vrm !== null) {
      writerContext.jsonDoc.json.extensions ??= {} as Record<string, unknown>
      writerContext.jsonDoc.json.extensions[EXTENSION_NAME] = this.vrm
    }
    return this
  }

  copyTo(target: Extension | null): void {
    const ext = target as VRMExtension
    if (target == null) return
    ext.vrm = this.vrm
  }
}
