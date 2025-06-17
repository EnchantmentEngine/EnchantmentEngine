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
