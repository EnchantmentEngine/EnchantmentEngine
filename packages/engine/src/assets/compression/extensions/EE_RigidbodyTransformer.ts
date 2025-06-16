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

const EXTENSION_NAME = 'EE_rigidbody'

interface IEERigidbody extends IProperty {
  type: string
  ccd: boolean
  allowRolling: boolean
  enabledRotations: any[]
  canSleep: boolean
  gravityScale: number
}

export class EERigidbody extends ExtensionProperty<IEERigidbody> {
  public static EXTENSION_NAME = EXTENSION_NAME
  public declare extensionName: typeof EXTENSION_NAME
  public declare propertyType: 'EERigidbody'
  public declare parentTypes: [PropertyType.NODE]

  protected init(): void {
    this.extensionName = EXTENSION_NAME
    this.propertyType = 'EERigidbody'
    this.parentTypes = [PropertyType.NODE]
  }

  protected getDefaults(): Nullable<IEERigidbody> {
    return Object.assign(super.getDefaults() as IProperty, {
      type: 'fixed',
      ccd: false,
      allowRolling: true,
      enabledRotations: [true, true, true],
      canSleep: true,
      gravityScale: 1
    })
  }

  public get type() {
    return this.get('type')
  }
  public set type(val: string) {
    this.set('type', val)
  }

  public get ccd() {
    return this.get('ccd')
  }
  public set ccd(val: boolean) {
    this.set('ccd', val)
  }

  public get allowRolling() {
    return this.get('allowRolling')
  }
  public set allowRolling(val: boolean) {
    this.set('allowRolling', val)
  }

  public get enabledRotations() {
    return this.get('enabledRotations') as unknown as boolean[]
  }
  public set enabledRotations(val: boolean[]) {
    this.set('enabledRotations', val as unknown as IEERigidbody['enabledRotations'])
  }

  public get canSleep() {
    return this.get('canSleep')
  }
  public set canSleep(val: boolean) {
    this.set('canSleep', val)
  }

  public get gravityScale() {
    return this.get('gravityScale')
  }
  public set gravityScale(val: number) {
    this.set('gravityScale', val)
  }
}

export class EERigidbodyExtension extends CopyableExtension {
  public readonly extensionName = EXTENSION_NAME
  public static readonly EXTENSION_NAME = EXTENSION_NAME

  public read(readerContext: ReaderContext): this {
    const nodeDefs = readerContext.jsonDoc.json.nodes || []
    nodeDefs.forEach((def, idx) => {
      if (def.extensions?.[EXTENSION_NAME]) {
        const eeRigidbody = new EERigidbody(this.document.getGraph())
        readerContext.nodes[idx].setExtension(EXTENSION_NAME, eeRigidbody)

        const rbDef = def.extensions[EXTENSION_NAME] as Partial<IEERigidbody>

        if (rbDef.type) eeRigidbody.type = rbDef.type
        if (typeof rbDef.ccd === 'boolean') eeRigidbody.ccd = rbDef.ccd
        if (typeof rbDef.allowRolling === 'boolean') eeRigidbody.allowRolling = rbDef.allowRolling
        if (Array.isArray(rbDef.enabledRotations)) eeRigidbody.enabledRotations = rbDef.enabledRotations
        if (typeof rbDef.canSleep === 'boolean') eeRigidbody.canSleep = rbDef.canSleep
        if (typeof rbDef.gravityScale === 'number') eeRigidbody.gravityScale = rbDef.gravityScale
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
        const eeRigidbody = node.getExtension<EERigidbody>(EXTENSION_NAME)
        if (eeRigidbody) {
          const nodeIdx = writerContext.nodeIndexMap.get(node)!
          const nodeDef = json.json.nodes![nodeIdx]
          nodeDef.extensions = nodeDef.extensions || {}

          nodeDef.extensions[EXTENSION_NAME] = {
            type: eeRigidbody.type,
            ccd: eeRigidbody.ccd,
            allowRolling: eeRigidbody.allowRolling,
            enabledRotations: eeRigidbody.enabledRotations,
            canSleep: eeRigidbody.canSleep,
            gravityScale: eeRigidbody.gravityScale
          }
        }
      })
    return this
  }

  public copyTo(target: Extension | null): void {
    if (!target || !(target instanceof EERigidbodyExtension)) return

    // No specific data to copy in this case as rigidbody data is per-node
  }
}
