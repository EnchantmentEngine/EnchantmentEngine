import { FrontSide, Vector3 } from 'three'

import { defineComponent, EntitySchema, getComponent } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { defineMaterialPlugin } from '../defineMaterialPlugin'

import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import {
  ditheringAlphatestChunk,
  ditheringFragUniform,
  ditheringVertex,
  ditheringVertexUniform
} from './ditherShaderChunk'

export const DitherCalculationType = {
  worldTransformed: 1,
  localPosition: 0
} as const

export type DitherCalculationType = (typeof DitherCalculationType)[keyof typeof DitherCalculationType]

export const MAX_DITHER_POINTS = 2 //should be equal to the length of the vec3 array in the shader

export const TransparencyDitheringRootComponent = defineComponent({
  name: 'TransparencyDitheringRootComponent',
  schema: Schema.Object({ materials: Schema.Array(EntitySchema.Entity()) })
})

export const TransparencyDitheringPluginComponent = defineMaterialPlugin({
  name: 'TransparencyDitheringPluginComponent',

  jsonID: 'IR_transparency_dithering',

  uniforms: Schema.Object({
    centers: Schema.Class(() => Array.from({ length: MAX_DITHER_POINTS }, () => new Vector3())),
    exponents: Schema.Class(() => Array.from({ length: MAX_DITHER_POINTS }, () => 1)),
    distances: Schema.Class(() => Array.from({ length: MAX_DITHER_POINTS }, () => 1)),
    useWorldCalculation: Schema.Class(() =>
      Array.from({ length: MAX_DITHER_POINTS }, () => DitherCalculationType.worldTransformed as DitherCalculationType)
    )
  }),

  onApply(shader, renderer) {
    if (!shader.vertexShader.startsWith('varying vec3 vWorldPosition')) {
      shader.vertexShader = shader.vertexShader.replace(
        /#include <common>/,
        '#include <common>\n' + ditheringVertexUniform
      )
    }
    shader.vertexShader = shader.vertexShader.replace(
      /#include <worldpos_vertex>/,
      '	#include <worldpos_vertex>\n' + ditheringVertex
    )
    if (!shader.fragmentShader.startsWith('varying vec3 vWorldPosition'))
      shader.fragmentShader = shader.fragmentShader.replace(
        /#include <common>/,
        '#include <common>\n' + ditheringFragUniform
      )
    shader.fragmentShader = shader.fragmentShader.replace(/#include <alphatest_fragment>/, ditheringAlphatestChunk)
  },

  reactor: ({ entity }) => {
    useEffect(() => {
      getComponent(entity, MaterialStateComponent).material.side = FrontSide
    }, [])
  }
})
