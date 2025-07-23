import { Shader } from 'three'

import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { defineMaterialPlugin } from '@ir-engine/engine/src/material/defineMaterialPlugin'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import {
  envmapParsReplaceLambert,
  envmapPhysicalParsReplace,
  envmapReplaceLambert,
  worldposReplace
} from '../classes/BPCEMShader'
import { EnvMapSourceType } from '../constants/EnvMapEnum'

export const EnvMapComponent = defineComponent({
  name: 'EnvMapComponent',
  jsonID: 'EE_envmap',

  schema: S.Object({
    type: S.LiteralUnion(Object.values(EnvMapSourceType), { default: EnvMapSourceType.Skybox }),
    envMapSourceColor: T.Color('#8080FF'),
    envMapSourceURL: S.String(),
    envMapCubemapURL: S.String(),
    envMapSourceEntityUUID: S.EntityID(),
    envMapIntensity: S.Number({ default: 1 })
  }),

  errors: ['MISSING_FILE']
})

export const BoxProjectionPlugin = defineMaterialPlugin({
  name: 'BoxProjectionPlugin',

  jsonID: 'IR_envmap_box_projection',

  uniforms: S.Object({
    cubeMapSize: T.Vec3(),
    cubeMapPos: T.Vec3()
  }),

  onApply: (shader: Shader) => {
    const shaderType = shader.shaderType
    const isPhysical = shaderType === 'MeshStandardMaterial' || shaderType === 'MeshPhysicalMaterial'
    const isSupported = isPhysical || shaderType === 'MeshLambertMaterial' || shaderType === 'MeshPhongMaterial'
    if (!isSupported) return

    if (isPhysical) {
      if (!shader.vertexShader.startsWith('varying vec3 vWorldPosition'))
        shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', worldposReplace)
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <envmap_physical_pars_fragment>',
        envmapPhysicalParsReplace
      )
    } else {
      shader.fragmentShader = shader.fragmentShader.replace('#include <envmap_pars_fragment>', envmapParsReplaceLambert)
      shader.fragmentShader = shader.fragmentShader.replace('#include <envmap_fragment>', envmapReplaceLambert)
    }
  }
})
