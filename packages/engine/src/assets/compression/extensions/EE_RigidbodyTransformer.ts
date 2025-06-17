/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

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
