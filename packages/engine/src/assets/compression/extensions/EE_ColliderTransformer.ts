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

const EXTENSION_NAME = 'EE_collider'

interface IEECollider extends IProperty {
  shape: string
  mass: number
  massCenter: { x: number; y: number; z: number }
  friction: number
  restitution: number
  collisionLayer: number
  collisionMask: number
  matchMesh: boolean
  centerOffset: { x: number; y: number; z: number }
  boxSize: { x: number; y: number; z: number }
  radius: number
  height: number
}

interface EEColliderDef {
  shape?: string
  mass?: number
  massCenter?: { x: number; y: number; z: number }
  friction?: number
  restitution?: number
  collisionLayer?: number
  collisionMask?: number
  matchMesh?: boolean
  centerOffset?: { x: number; y: number; z: number }
  boxSize?: { x: number; y: number; z: number }
  radius?: number
  height?: number
}

export class EECollider extends ExtensionProperty<IEECollider> {
  public static EXTENSION_NAME = EXTENSION_NAME
  public declare extensionName: typeof EXTENSION_NAME
  public declare propertyType: 'EECollider'
  public declare parentTypes: [PropertyType.NODE]

  protected init(): void {
    this.extensionName = EXTENSION_NAME
    this.propertyType = 'EECollider'
    this.parentTypes = [PropertyType.NODE]
  }

  protected getDefaults(): Nullable<IEECollider> {
    return Object.assign(super.getDefaults() as IProperty, {
      shape: 'box',
      mass: 1,
      massCenter: { x: 0, y: 0, z: 0 },
      friction: 0.5,
      restitution: 0.5,
      collisionLayer: 1,
      collisionMask: 7,
      matchMesh: true,
      centerOffset: { x: 0, y: 0, z: 0 },
      boxSize: { x: 1, y: 1, z: 1 },
      radius: 1,
      height: 2
    })
  }

  public get shape() {
    return this.get('shape')
  }
  public set shape(val: string) {
    this.set('shape', val)
  }

  public get mass() {
    return this.get('mass')
  }
  public set mass(val: number) {
    this.set('mass', val)
  }

  public get massCenter() {
    return this.get('massCenter')
  }
  public set massCenter(val: { x: number; y: number; z: number }) {
    this.set('massCenter', val)
  }

  public get friction() {
    return this.get('friction')
  }
  public set friction(val: number) {
    this.set('friction', val)
  }

  public get restitution() {
    return this.get('restitution')
  }
  public set restitution(val: number) {
    this.set('restitution', val)
  }

  public get collisionLayer() {
    return this.get('collisionLayer')
  }
  public set collisionLayer(val: number) {
    this.set('collisionLayer', val)
  }

  public get collisionMask() {
    return this.get('collisionMask')
  }
  public set collisionMask(val: number) {
    this.set('collisionMask', val)
  }

  public get matchMesh() {
    return this.get('matchMesh')
  }
  public set matchMesh(val: boolean) {
    this.set('matchMesh', val)
  }

  public get centerOffset() {
    return this.get('centerOffset')
  }
  public set centerOffset(val: { x: number; y: number; z: number }) {
    this.set('centerOffset', val)
  }

  public get boxSize() {
    return this.get('boxSize')
  }
  public set boxSize(val: { x: number; y: number; z: number }) {
    this.set('boxSize', val)
  }

  public get radius() {
    return this.get('radius')
  }
  public set radius(val: number) {
    this.set('radius', val)
  }

  public get height() {
    return this.get('height')
  }
  public set height(val: number) {
    this.set('height', val)
  }
}

export class EEColliderExtension extends CopyableExtension {
  public readonly extensionName = EXTENSION_NAME
  public static readonly EXTENSION_NAME = EXTENSION_NAME

  public read(readerContext: ReaderContext): this {
    const nodeDefs = readerContext.jsonDoc.json.nodes || []
    nodeDefs.forEach((def, idx) => {
      if (def.extensions?.[EXTENSION_NAME]) {
        const eeCollider = new EECollider(this.document.getGraph())
        readerContext.nodes[idx].setExtension(EXTENSION_NAME, eeCollider)

        const colliderDef = def.extensions[EXTENSION_NAME] as EEColliderDef

        if (colliderDef.shape !== undefined) {
          eeCollider.shape = colliderDef.shape
        }
        if (colliderDef.mass !== undefined) {
          eeCollider.mass = colliderDef.mass
        }
        if (colliderDef.massCenter !== undefined) {
          eeCollider.massCenter = colliderDef.massCenter
        }
        if (colliderDef.friction !== undefined) {
          eeCollider.friction = colliderDef.friction
        }
        if (colliderDef.restitution !== undefined) {
          eeCollider.restitution = colliderDef.restitution
        }
        if (colliderDef.collisionLayer !== undefined) {
          eeCollider.collisionLayer = colliderDef.collisionLayer
        }
        if (colliderDef.collisionMask !== undefined) {
          eeCollider.collisionMask = colliderDef.collisionMask
        }
        if (colliderDef.matchMesh !== undefined) {
          eeCollider.matchMesh = colliderDef.matchMesh
        }
        if (colliderDef.centerOffset !== undefined) {
          eeCollider.centerOffset = colliderDef.centerOffset
        }
        if (colliderDef.boxSize !== undefined) {
          eeCollider.boxSize = colliderDef.boxSize
        }
        if (colliderDef.radius !== undefined) {
          eeCollider.radius = colliderDef.radius
        }
        if (colliderDef.height !== undefined) {
          eeCollider.height = colliderDef.height
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
        const eeCollider = node.getExtension<EECollider>(EXTENSION_NAME)
        if (eeCollider) {
          const nodeIdx = writerContext.nodeIndexMap.get(node)!
          const nodeDef = json.json.nodes![nodeIdx]
          nodeDef.extensions = nodeDef.extensions || {}

          nodeDef.extensions[EXTENSION_NAME] = {
            shape: eeCollider.shape,
            mass: eeCollider.mass,
            massCenter: eeCollider.massCenter,
            friction: eeCollider.friction,
            restitution: eeCollider.restitution,
            collisionLayer: eeCollider.collisionLayer,
            collisionMask: eeCollider.collisionMask,
            matchMesh: eeCollider.matchMesh,
            centerOffset: eeCollider.centerOffset,
            boxSize: eeCollider.boxSize,
            radius: eeCollider.radius,
            height: eeCollider.height
          }
        }
      })
    return this
  }

  public copyTo(target: Extension | null): void {
    if (!target || !(target instanceof EEColliderExtension)) return

    // No specific data to copy in this case as collider data is per-node
  }
}
