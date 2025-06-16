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

const EXTENSION_NAME = 'EE_uuid'

interface IEEUuid extends IProperty {
  entityID: string
}

export class EEUuid extends ExtensionProperty<IEEUuid> {
  public static EXTENSION_NAME = EXTENSION_NAME
  public declare extensionName: typeof EXTENSION_NAME
  public declare propertyType: 'EEUuid'
  public declare parentTypes: [PropertyType.NODE]

  protected init(): void {
    this.extensionName = EXTENSION_NAME
    this.propertyType = 'EEUuid'
    this.parentTypes = [PropertyType.NODE]
  }

  protected getDefaults(): Nullable<IEEUuid> {
    return Object.assign(super.getDefaults() as IProperty, {
      entityID: ''
    })
  }

  public get entityID() {
    return this.get('entityID')
  }
  public set entityID(val: string) {
    this.set('entityID', val)
  }
}

export class EEUuidExtension extends CopyableExtension {
  public readonly extensionName = EXTENSION_NAME
  public static readonly EXTENSION_NAME = EXTENSION_NAME

  public read(readerContext: ReaderContext): this {
    const nodeDefs = readerContext.jsonDoc.json.nodes || []
    nodeDefs.forEach((def, idx) => {
      if (def.extensions?.[EXTENSION_NAME]) {
        const eeUuid = new EEUuid(this.document.getGraph())
        readerContext.nodes[idx].setExtension(EXTENSION_NAME, eeUuid)

        const uuidDef = def.extensions[EXTENSION_NAME]
        // Handle both string values and object with entityID
        if (typeof uuidDef === 'string') {
          eeUuid.entityID = uuidDef
        } else if (typeof uuidDef === 'object' && 'entityID' in uuidDef) {
          if (typeof uuidDef.entityID === 'string') {
            eeUuid.entityID = uuidDef.entityID
          }
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
        const eeUuid = node.getExtension<EEUuid>(EXTENSION_NAME)
        if (eeUuid) {
          const nodeIdx = writerContext.nodeIndexMap.get(node)!
          const nodeDef = json.json.nodes![nodeIdx]
          nodeDef.extensions = nodeDef.extensions || {}

          // Based on your file format, it seems some UUIDs are stored directly as strings
          // while others are stored as objects with entityID property
          if (eeUuid.entityID.match(/^[0-9]+$/)) {
            // If it's just a number as string, store it directly
            nodeDef.extensions[EXTENSION_NAME] = eeUuid.entityID
          } else {
            // Otherwise store as object with entityID property
            nodeDef.extensions[EXTENSION_NAME] = {
              entityID: eeUuid.entityID
            }
          }
        }
      })
    return this
  }

  public copyTo(target: Extension | null): void {
    if (!target || !(target instanceof EEUuidExtension)) return

    // No specific data to copy in this case as UUID data is per-node
  }
}
