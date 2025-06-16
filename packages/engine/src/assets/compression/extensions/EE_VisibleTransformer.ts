import {
  Extension,
  ExtensionProperty,
  IProperty,
  Nullable,
  PropertyType,
  ReaderContext,
  WriterContext
} from '@gltf-transform/core'
import { CopyableExtension } from './CopyableExtension'

const EXTENSION_NAME = 'EE_visible'

interface IEEVisible extends IProperty {
  visible: boolean
}

export class EEVisible extends ExtensionProperty<IEEVisible> {
  public static EXTENSION_NAME = EXTENSION_NAME
  public declare extensionName: typeof EXTENSION_NAME
  public declare propertyType: 'EEVisible'
  public declare parentTypes: [PropertyType.NODE]

  protected init(): void {
    this.extensionName = EXTENSION_NAME
    this.propertyType = 'EEVisible'
    this.parentTypes = [PropertyType.NODE]
  }

  protected getDefaults(): Nullable<IEEVisible> {
    return Object.assign(super.getDefaults() as IProperty, {
      visible: true
    })
  }

  public get visible(): boolean {
    return this.get('visible')
  }

  public set visible(val: boolean) {
    this.set('visible', val)
  }
}

export class EEVisibleExtension extends CopyableExtension {
  public readonly extensionName = EXTENSION_NAME
  public static readonly EXTENSION_NAME = EXTENSION_NAME

  public read(readerContext: ReaderContext): this {
    const nodeDefs = readerContext.jsonDoc.json.nodes || []
    nodeDefs.forEach((def, idx) => {
      const ext = def.extensions?.[EXTENSION_NAME]
      if (ext !== undefined) {
        const eeVisible = new EEVisible(this.document.getGraph())
        readerContext.nodes[idx].setExtension(EXTENSION_NAME, eeVisible)

        if (typeof ext === 'boolean') {
          eeVisible.visible = ext
        } else {
          eeVisible.visible = true // fallback for unknown formats
        }
      }
    })
    return this
  }

  public write(writerContext: WriterContext): this {
    const json = writerContext.jsonDoc
    this.document
      .getRoot()
      .listNodes()
      .forEach((node) => {
        const eeVisible = node.getExtension<EEVisible>(EXTENSION_NAME)
        if (eeVisible) {
          const nodeIdx = writerContext.nodeIndexMap.get(node)!
          const nodeDef = json.json.nodes![nodeIdx]
          nodeDef.extensions = nodeDef.extensions || {}

          // Write as plain boolean
          nodeDef.extensions[EXTENSION_NAME] = eeVisible.visible
        }
      })
    return this
  }

  public copyTo(target: Extension | null): void {
    if (!target || !(target instanceof EEVisibleExtension)) return
    // Nothing to copy; all data is per-node.
  }
}
