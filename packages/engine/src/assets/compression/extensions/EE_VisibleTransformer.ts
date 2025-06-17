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
