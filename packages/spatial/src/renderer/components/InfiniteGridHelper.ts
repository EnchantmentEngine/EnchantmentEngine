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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  LineBasicMaterial,
  Mesh,
  NormalBlending,
  PlaneGeometry,
  ShaderMaterial,
  Vector3
} from 'three'

import { Entity, EntityTreeComponent, createEntity, removeEntity, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '../../common/NameComponent'
import { setVisibleComponent } from '../../renderer/components/VisibleComponent'
import { T } from '../../schema/schemaFunctions'
import { RendererState } from '../RendererState'
import LogarithmicDepthBufferMaterialChunk from '../constants/LogarithmicDepthBufferMaterialChunk'
import { ObjectLayerMasks } from '../constants/ObjectLayers'
import { LineSegmentComponent } from './LineSegmentComponent'
import { MeshComponent } from './MeshComponent'
import { ObjectLayerMaskComponent } from './ObjectLayerComponent'

/**
 * Original Author: Fyrestar
 * https://discourse.threejs.org/t/three-infinitegridhelper-anti-aliased/8377
 */
const vertexShaderGrid = `
varying vec3 worldPosition;

uniform float uDistance;

#include <logdepthbuf_pars_vertex>
${LogarithmicDepthBufferMaterialChunk}

void main() {
  // Expand grid around camera and flatten
  vec3 pos = position.xzy * uDistance;
  pos.xz += cameraPosition.xz;

  // Output world position
  worldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

  // Project to screen
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  #include <logdepthbuf_vertex>
}
`

const fragmentShaderGrid = `
varying vec3 worldPosition;

uniform float uSize1;
uniform float uSize2;
uniform vec3 uColor;
uniform float uFadeDistance;
uniform float uLineSpacing;
uniform float uLineThickness;
uniform vec3 uCameraPos;

#include <logdepthbuf_pars_fragment>

float getDashedLine(float coord, float spacing, float thickness, float dashSize) {
  float modulo = mod(coord, spacing);
  float dash = step(dashSize, mod(coord, spacing * 2.0));
  float dist = min(modulo, spacing - modulo);
  float baseLine = smoothstep(thickness, 0.0, dist);
  return baseLine * dash;
}

float getDottedLine(float x, float z, float spacing, float thickness) {
  float mx = mod(x, spacing);
  float mz = mod(z, spacing);
  float dx = min(mx, spacing - mx);
  float dz = min(mz, spacing - mz);
  float dotDist = length(vec2(dx, dz));
  return smoothstep(thickness, 0.0, dotDist);
}

float getGrid(float size) {
  float gx = getGridLine(worldPosition.x / size);
  float gz = getGridLine(worldPosition.z / size);
  return max(gx, gz);
}

float getGridLine(float coord) {
  float modulo = mod(coord, uLineSpacing);
  float dist = min(modulo, uLineSpacing - modulo);
  return smoothstep(uLineThickness, 0.0, dist);
}

float getXAxisLine() {
  float lineWidth = 0.1;
  return 1.0 - smoothstep(-lineWidth, lineWidth, abs(worldPosition.x));
}

float getZAxisLine() {
  float lineWidth = 0.1;
  return 1.0 - smoothstep(-lineWidth, lineWidth, abs(worldPosition.z));
}

float randNoise(vec2 co, float t) {
  return fract(sin(dot(co + t, vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  #include <logdepthbuf_fragment>

  float dist = distance(worldPosition.xz, uCameraPos.xz);
  float fade = 1.0 - smoothstep(uFadeDistance * 0.5, uFadeDistance, dist);
  fade = pow(fade, 3.0);

  float g1 = getGrid(uSize1);
  float g2 = getGrid(uSize2);
  float tileBlend = mix(g2, g1, g1);

  float lineX = getDashedLine(worldPosition.x, uLineSpacing, uLineThickness, 0.5);
  float lineZ = getDashedLine(worldPosition.z, uLineSpacing, uLineThickness, 0.5);
  float lineGrid = max(lineX, lineZ);
  float dotted = getDottedLine(worldPosition.x, worldPosition.z, uLineSpacing, uLineThickness);

  // Discard near center axis
  if (getXAxisLine() > 0.95 || getZAxisLine() > 0.95) discard;

  float noise = randNoise(worldPosition.xz * 0.5, 0.0);
  float noiseFactor = 0.98 + 0.02 * noise;

  vec4 color = vec4(uColor.rgb * noiseFactor, tileBlend * fade);
  color.a = mix(0.5 * color.a, color.a, g2);
  color.a *= smoothstep(0.01, 1.0, lineGrid);

  if (color.a <= 0.05) discard;
  gl_FragColor = color;
}`

export const InfiniteGridComponent = defineComponent({
  name: 'InfiniteGridComponent',

  schema: S.Object({
    size: S.Number(1),
    color: T.Color(0x535353),
    distance: S.Number(200)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, InfiniteGridComponent)
    const engineRendererSettings = useMutableState(RendererState)

    const mesh = useHookstate(() => {
      setComponent(
        entity,
        MeshComponent,
        new Mesh(
          new PlaneGeometry(2, 2, 1, 1),

          new ShaderMaterial({
            side: DoubleSide,
            uniforms: {
              uColor: { value: component.color.value },
              uSize1: { value: component.size.value },
              uSize2: { value: component.size.value * 10 },
              uDistance: { value: component.distance.value },
              uFadeDistance: { value: 100.0 },
              uLineSpacing: { value: component.size.value },
              uLineThickness: { value: 0.01 },
              uCameraPos: { value: new Vector3() }
            },
            transparent: true,
            vertexShader: vertexShaderGrid,
            fragmentShader: fragmentShaderGrid,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            polygonOffsetUnits: -1.0,
            depthWrite: false,
            extensions: {
              derivatives: true
            }
          })
        )
      )
      return getComponent(entity, MeshComponent)
    }).value as Mesh<PlaneGeometry, ShaderMaterial>

    useEffect(() => {
      return () => {
        removeComponent(entity, MeshComponent)
      }
    }, [])

    useEffect(() => {
      mesh.position.y = engineRendererSettings.gridHeight.value
      mesh.updateMatrixWorld(true)
    }, [engineRendererSettings.gridHeight])

    useEffect(() => {
      mesh.material.uniforms.uColor.value = component.color.value
    }, [component.color])

    useEffect(() => {
      const size = component.size.value
      mesh.material.uniforms.uSize1.value = size
      mesh.material.uniforms.uSize2.value = size * 10
    }, [component.size])

    useEffect(() => {
      if (!mesh) return
      mesh.material.uniforms.uDistance.value = component.distance.value

      const lineEntities = [] as Entity[]
      const lineColors = ['red', 'green', 'blue']
      for (let i = 0; i < lineColors.length; i++) {
        const lineGeometry = new BufferGeometry()
        const floatArray = [0, 0, 0, 0, 0, 0]
        floatArray[i] = -component.distance.value
        floatArray[i + 3] = component.distance.value
        const linePositions = new Float32Array(floatArray)
        lineGeometry.setAttribute('position', new BufferAttribute(linePositions, 3))
        const lineMaterial = new LineBasicMaterial({
          side: DoubleSide,
          color: lineColors[i],
          transparent: true,
          opacity: 0.3,
          linewidth: 2,
          blending: NormalBlending,
          depthTest: true,
          depthWrite: true
        })

        const lineEntity = createEntity()
        setComponent(lineEntity, LineSegmentComponent, {
          name: `infinite-grid-helper-line-${i}`,
          geometry: lineGeometry,
          material: lineMaterial
        })
        setComponent(lineEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(entity, ObjectLayerMaskComponent, ObjectLayerMasks.Gizmos)
        lineEntities.push(lineEntity)
      }

      return () => {
        for (const lineEntity of lineEntities) removeEntity(lineEntity)
      }
    }, [component.distance])

    return null
  }
})

export const createInfiniteGridHelper = () => {
  const entity = createEntity()
  setComponent(entity, EntityTreeComponent)
  setComponent(entity, InfiniteGridComponent)
  setComponent(entity, NameComponent, 'Infinite Grid Helper')
  setComponent(entity, ObjectLayerMaskComponent, ObjectLayerMasks.Gizmos)
  setVisibleComponent(entity, true)
  return entity
}
