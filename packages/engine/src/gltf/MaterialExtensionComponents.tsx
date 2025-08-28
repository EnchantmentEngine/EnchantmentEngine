import { GLTF } from '@gltf-transform/core'
import { Component, ComponentType, defineComponent } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'
import { Vector2_One, Vector2_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import {
  Color,
  LinearSRGBColorSpace,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  SRGBColorSpace,
  Texture,
  Vector2
} from 'three'
import { getDependency, GLTFLoaderFunctions, GLTFParserOptions } from './GLTFLoaderFunctions'

export type MaterialTextureValue = {
  contents: { index: number; texCoord: number }
}

export type MaterialColorValue = {
  contents: Color
}

export type MaterialNumberValue = {
  contents: number
}

export type MaterialVec3Value = {
  contents: [number, number, number]
}

export type MaterialVec2Value = {
  contents: [number, number]
}

export type MaterialValue =
  | MaterialTextureValue
  | MaterialColorValue
  | MaterialNumberValue
  | MaterialVec3Value
  | MaterialVec2Value

const colorValueToTupleValue = (colorValue: MaterialColorValue) => {
  if (colorValue.contents.isColor) return colorValue.contents.toArray() as [number, number, number]
  else {
    return new Color(colorValue.contents).toArray() as [number, number, number]
  }
}

type MaterialExtension<Comp extends Component> = {
  [Key in keyof ComponentType<Comp>]?: MaterialValue['contents']
}

export const TextureInfoSchema = Schema.Object({
  index: Schema.Number(),
  texCoord: Schema.Optional(Schema.Number()),
  extensions: Schema.Optional(Schema.Record(Schema.String(), Schema.Any())),
  extras: Schema.Optional(Schema.Record(Schema.String(), Schema.Any()))
})

export const MaterialNormalTextureInfoSchema = Schema.Object({
  index: Schema.Number(),
  scale: Schema.Optional(Schema.Number()),
  texCoord: Schema.Optional(Schema.Number()),
  extensions: Schema.Optional(Schema.Record(Schema.String(), Schema.Any())),
  extras: Schema.Optional(Schema.Record(Schema.String(), Schema.Any()))
})

/**
 * Unlit Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
 */
export const KHRUnlitExtensionComponent = defineComponent({
  name: 'KHRUnlitExtensionComponent',
  jsonID: 'KHR_materials_unlit',
  schema: Schema.Record(Schema.Any(), Schema.Any(), {}),

  getMaterialType() {
    return MeshBasicMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    let pending = undefined as undefined | Promise<void>

    materialParams.color = new Color(1.0, 1.0, 1.0)
    materialParams.opacity = 1.0

    const metallicRoughness = materialDef.pbrMetallicRoughness

    if (metallicRoughness) {
      if (Array.isArray(metallicRoughness.baseColorFactor)) {
        const array = metallicRoughness.baseColorFactor

        materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace)
        materialParams.opacity = array[3]
      }

      if (metallicRoughness.baseColorTexture != undefined) {
        pending = GLTFLoaderFunctions.assignTexture(options, metallicRoughness.baseColorTexture).then((map) => {
          materialParams.map = map
          if (map) map.colorSpace = SRGBColorSpace
        })
      }
    }

    return pending ?? Promise.resolve(undefined)
  }
})

/**
 * Materials Emissive Strength Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/blob/5768b3ce0ef32bc39cdf1bef10b948586635ead3/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md
 */
export const KHREmissiveStrengthExtensionComponent = defineComponent({
  name: 'KHREmissiveStrengthExtensionComponent',
  jsonID: 'KHR_materials_emissive_strength',
  schema: Schema.Object({ emissiveStrength: Schema.Optional(Schema.Number()) }),

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const extension = materialDef.extensions![KHREmissiveStrengthExtensionComponent.jsonID] as ComponentType<
      typeof KHREmissiveStrengthExtensionComponent
    >
    const emissiveStrength = extension.emissiveStrength

    if (emissiveStrength != undefined) {
      materialParams.emissiveIntensity = emissiveStrength
    }

    return Promise.resolve()
  },

  exportMaterialExtension(materialValues: Record<string, MaterialValue>) {
    if (materialValues.emissiveIntensity?.contents != undefined) {
      const ext = { emissiveStrength: materialValues.emissiveIntensity.contents }
      delete materialValues.emissiveIntensity
      return ext
    }

    return undefined
  }
})

/**
 * Clearcoat Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
 */
export const KHRClearcoatExtensionComponent = defineComponent({
  name: 'KHRClearcoatExtensionComponent',
  jsonID: 'KHR_materials_clearcoat',
  schema: Schema.Object({
    clearcoatFactor: Schema.Optional(Schema.Number()),
    clearcoatTexture: Schema.Optional(TextureInfoSchema),
    clearcoatRoughnessFactor: Schema.Optional(Schema.Number()),
    clearcoatRoughnessTexture: Schema.Optional(TextureInfoSchema),
    clearcoatNormalTexture: Schema.Optional(MaterialNormalTextureInfoSchema)
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![KHRClearcoatExtensionComponent.jsonID] as ComponentType<
      typeof KHRClearcoatExtensionComponent
    >

    if (extension.clearcoatFactor != undefined) {
      materialParams.clearcoat = extension.clearcoatFactor
    }

    if (extension.clearcoatTexture != undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.clearcoatTexture).then((map) => {
          materialParams.clearcoatMap = map
        })
      )
    }

    if (extension.clearcoatRoughnessFactor != undefined) {
      materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor
    }

    if (extension.clearcoatRoughnessTexture != undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.clearcoatRoughnessTexture).then((map) => {
          materialParams.clearcoatRoughnessMap = map
        })
      )
    }

    if (extension.clearcoatNormalTexture?.index != undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.clearcoatNormalTexture).then((map) => {
          materialParams.clearcoatNormalMap = map
        })
      )

      if (extension.clearcoatNormalTexture.scale != undefined) {
        const scale = extension.clearcoatNormalTexture.scale

        materialParams.clearcoatNormalScale = new Vector2(scale, scale)
      }
    }

    return Promise.all(pending)
  },

  exportMaterialExtension(materialValues: Record<string, MaterialValue>) {
    const extension = {} as MaterialExtension<typeof KHRClearcoatExtensionComponent>
    if (materialValues.clearcoat != undefined) {
      extension.clearcoatFactor = materialValues.clearcoat.contents
      delete materialValues.clearcoat
    }
    if (materialValues.clearcoatMap != undefined) {
      extension.clearcoatTexture = materialValues.clearcoatMap.contents
      delete materialValues.clearcoatMap
    }
    if (materialValues.clearcoatRoughness != undefined) {
      extension.clearcoatRoughnessFactor = materialValues.clearcoatRoughness.contents
      delete materialValues.clearcoatRoughness
    }
    if (materialValues.clearcoatRoughnessMap != undefined) {
      extension.clearcoatRoughnessTexture = materialValues.clearcoatRoughnessMap.contents
      delete materialValues.clearcoatRoughnessMap
    }
    if (materialValues.clearcoatNormalMap != undefined) {
      extension.clearcoatNormalTexture = materialValues.clearcoatNormalMap.contents
      delete materialValues.clearcoatRoughnessMap
      if (materialValues.clearcoatNormalScale != undefined) {
        ;(extension.clearcoatNormalTexture as any).scale = materialValues.clearcoatNormalScale.contents[0]
        delete materialValues.clearcoatNormalScale
      }
    }

    return extension
  }
})

/**
 * Iridescence Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_iridescence
 */
export const KHRIridescenceExtensionComponent = defineComponent({
  name: 'KHRIridescenceExtensionComponent',
  jsonID: 'KHR_materials_iridescence',
  schema: Schema.Object({
    iridescenceFactor: Schema.Optional(Schema.Number()),
    iridescenceTexture: Schema.Optional(TextureInfoSchema),
    iridescenceIor: Schema.Optional(Schema.Number()),
    iridescenceThicknessMinimum: Schema.Optional(Schema.Number()),
    iridescenceThicknessMaximum: Schema.Optional(Schema.Number()),
    iridescenceThicknessTexture: Schema.Optional(TextureInfoSchema)
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![KHRIridescenceExtensionComponent.jsonID] as ComponentType<
      typeof KHRIridescenceExtensionComponent
    >
    if (extension.iridescenceFactor != undefined) {
      materialParams.iridescence = extension.iridescenceFactor
    }

    if (extension.iridescenceTexture != undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.iridescenceTexture).then((map) => {
          materialParams.iridescenceMap = map
        })
      )
    }

    if (extension.iridescenceIor != undefined) {
      materialParams.iridescenceIOR = extension.iridescenceIor
    }

    if (materialParams.iridescenceThicknessRange === undefined) {
      materialParams.iridescenceThicknessRange = [100, 400]
    }

    if (extension.iridescenceThicknessMinimum != undefined) {
      materialParams.iridescenceThicknessRange[0] = extension.iridescenceThicknessMinimum
    }

    if (extension.iridescenceThicknessMaximum != undefined) {
      materialParams.iridescenceThicknessRange[1] = extension.iridescenceThicknessMaximum
    }

    if (extension.iridescenceThicknessTexture != undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.iridescenceThicknessTexture).then((map) => {
          materialParams.iridescenceThicknessMap = map
        })
      )
    }

    return Promise.all(pending)
  },

  exportMaterialExtension(materialValues: Record<string, MaterialValue>) {
    const extension = {} as MaterialExtension<typeof KHRIridescenceExtensionComponent>
    if (materialValues.iridescence != undefined) {
      extension.iridescenceFactor = materialValues.iridescence.contents
      delete materialValues.iridescence
    }
    if (materialValues.iridescenceMap != undefined) {
      extension.iridescenceTexture = materialValues.iridescenceMap.contents
      delete materialValues.iridescenceMap
    }
    if (materialValues.iridescenceIOR != undefined) {
      extension.iridescenceIor = materialValues.iridescenceIOR.contents
      delete materialValues.iridescenceIOR
    }
    if (materialValues.iridescenceThicknessMap != undefined) {
      extension.iridescenceThicknessTexture = materialValues.iridescenceThicknessMap.contents
      delete materialValues.iridescenceThicknessMap
    }
    if (materialValues.iridescenceThicknessRange != undefined) {
      extension.iridescenceThicknessMinimum = materialValues.iridescenceThicknessRange.contents[0]
      extension.iridescenceThicknessMaximum = materialValues.iridescenceThicknessRange.contents[1]
      delete materialValues.iridescenceThicknessRange
    }

    return extension
  }
})

/**
 * Sheen Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_sheen
 */
export const KHRSheenExtensionComponent = defineComponent({
  name: 'KHRSheenExtensionComponent',
  jsonID: 'KHR_materials_sheen',
  schema: Schema.Object({
    sheenColorFactor: Schema.Optional(Schema.Tuple([Schema.Number(), Schema.Number(), Schema.Number()])),
    sheenRoughnessFactor: Schema.Optional(Schema.Number()),
    sheenColorTexture: Schema.Optional(TextureInfoSchema),
    sheenRoughnessTexture: Schema.Optional(TextureInfoSchema)
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    materialParams.sheenColor = new Color(0, 0, 0)
    materialParams.sheenRoughness = 0
    materialParams.sheen = 1

    const extension = materialDef.extensions![KHRSheenExtensionComponent.jsonID] as ComponentType<
      typeof KHRSheenExtensionComponent
    >

    if (extension.sheenColorFactor != undefined) {
      const colorFactor = extension.sheenColorFactor
      materialParams.sheenColor.setRGB(colorFactor[0], colorFactor[1], colorFactor[2], LinearSRGBColorSpace)
    }

    if (extension.sheenRoughnessFactor != undefined) {
      materialParams.sheenRoughness = extension.sheenRoughnessFactor
    }

    if (extension.sheenColorTexture != undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.sheenColorTexture).then((map) => {
          materialParams.sheenColorMap = map
          if (map) map.colorSpace = SRGBColorSpace
        })
      )
    }

    if (extension.sheenRoughnessTexture != undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.sheenRoughnessTexture).then((map) => {
          materialParams.sheenRoughnessMap = map
        })
      )
    }

    return Promise.all(pending)
  },

  exportMaterialExtension(materialValues: Record<string, MaterialValue>) {
    const extension = {} as MaterialExtension<typeof KHRSheenExtensionComponent>
    if (materialValues.sheenColor != undefined) {
      extension.sheenColorFactor = colorValueToTupleValue(materialValues.sheenColor as MaterialColorValue)
      delete materialValues.sheenColor
    }
    if (materialValues.sheenColorMap != undefined) {
      extension.sheenColorTexture = materialValues.sheenColorMap.contents
      delete materialValues.sheenColorMap
    }
    if (materialValues.sheenRoughness != undefined) {
      extension.sheenRoughnessFactor = materialValues.sheenRoughness.contents
      delete materialValues.sheenRoughness
    }
    if (materialValues.sheenRoughnessMap != undefined) {
      extension.sheenRoughnessTexture = materialValues.sheenRoughnessMap.contents
      delete materialValues.sheenRoughnessMap
    }

    return extension
  }
})

/**
 * Transmission Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
 * Draft: https://github.com/KhronosGroup/glTF/pull/1698
 */
export const KHRTransmissionExtensionComponent = defineComponent({
  name: 'KHRTransmissionExtensionComponent',
  jsonID: 'KHR_materials_transmission',
  schema: Schema.Object({
    transmissionFactor: Schema.Optional(Schema.Number()),
    transmissionTexture: Schema.Optional(TextureInfoSchema)
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![KHRTransmissionExtensionComponent.jsonID] as ComponentType<
      typeof KHRTransmissionExtensionComponent
    >
    if (extension.transmissionFactor != undefined) {
      materialParams.transmission = extension.transmissionFactor
    }

    if (extension.transmissionTexture != undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.transmissionTexture).then((map) => {
          materialParams.transmissionMap = map
        })
      )
    }

    return Promise.all(pending)
  },

  exportMaterialExtension(materialValues: Record<string, MaterialValue>) {
    const extension = {} as MaterialExtension<typeof KHRTransmissionExtensionComponent>
    if (materialValues.transmission != undefined) {
      extension.transmissionFactor = materialValues.transmission.contents
      delete materialValues.transmission
    }
    if (materialValues.transmissionMap != undefined) {
      extension.transmissionTexture = materialValues.transmissionMap.contents
      delete materialValues.transmissionMap
    }

    return extension
  }
})

/**
 * Materials Volume Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
 */
export const KHRVolumeExtensionComponent = defineComponent({
  name: 'KHRVolumeExtensionComponent',
  jsonID: 'KHR_materials_volume',
  schema: Schema.Object({
    thicknessFactor: Schema.Optional(Schema.Number()),
    thicknessTexture: Schema.Optional(TextureInfoSchema),
    attenuationDistance: Schema.Optional(Schema.Number()),
    attenuationColor: Schema.Optional(Schema.Tuple([Schema.Number(), Schema.Number(), Schema.Number()]))
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![KHRVolumeExtensionComponent.jsonID] as ComponentType<
      typeof KHRVolumeExtensionComponent
    >
    materialParams.thickness = extension.thicknessFactor != undefined ? extension.thicknessFactor : 0

    if (extension.thicknessTexture != undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.thicknessTexture).then((map) => {
          materialParams.thicknessMap = map
        })
      )
    }

    materialParams.attenuationDistance = extension.attenuationDistance || Infinity

    const colorArray = extension.attenuationColor || [1, 1, 1]
    materialParams.attenuationColor = new Color().setRGB(
      colorArray[0],
      colorArray[1],
      colorArray[2],
      LinearSRGBColorSpace
    )

    return Promise.all(pending)
  },

  exportMaterialExtension(materialValues: Record<string, MaterialValue>) {
    const extension = {} as MaterialExtension<typeof KHRVolumeExtensionComponent>
    if (materialValues.thickness != undefined) {
      extension.thicknessFactor = materialValues.thickness.contents
      delete materialValues.thickness
    }
    if (materialValues.thicknessMap != undefined) {
      extension.thicknessTexture = materialValues.thicknessMap.contents
      delete materialValues.thicknessMap
    }
    if (materialValues.attenuationDistance != undefined) {
      extension.attenuationDistance = materialValues.attenuationDistance.contents
      delete materialValues.attenuationDistance
    }
    if (materialValues.attenuationColor != undefined) {
      extension.attenuationColor = colorValueToTupleValue(materialValues.attenuationColor as MaterialColorValue)
      delete materialValues.attenuationColor
    }

    return extension
  }
})

/**
 * Materials ior Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior
 */
export const KHRIorExtensionComponent = defineComponent({
  name: 'KHRIorExtensionComponent',
  jsonID: 'KHR_materials_ior',
  schema: Schema.Object({
    ior: Schema.Optional(Schema.Number())
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const extension = materialDef.extensions![KHRIorExtensionComponent.jsonID] as ComponentType<
      typeof KHRIorExtensionComponent
    >
    materialParams.ior = extension.ior != undefined ? extension.ior : 1.5

    return Promise.resolve()
  },

  exportMaterialExtension(materialValues: Record<string, MaterialValue>) {
    const extension = {} as MaterialExtension<typeof KHRIorExtensionComponent>
    if (materialValues.ior != undefined) {
      extension.ior = materialValues.ior.contents
      delete materialValues.ior
    }

    return extension
  }
})

/**
 * Materials specular Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular
 */
export const KHRSpecularExtensionComponent = defineComponent({
  name: 'KHRSpecularExtensionComponent',
  jsonID: 'KHR_materials_specular',
  schema: Schema.Object({
    specularFactor: Schema.Optional(Schema.Number()),
    specularTexture: TextureInfoSchema,
    specularColorFactor: Schema.Optional(Schema.Tuple([Schema.Number(), Schema.Number(), Schema.Number()])),
    specularColorTexture: TextureInfoSchema
  }),
  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![KHRSpecularExtensionComponent.jsonID] as ComponentType<
      typeof KHRSpecularExtensionComponent
    >
    materialParams.specularIntensity = extension.specularFactor != undefined ? extension.specularFactor : 1.0

    if (extension?.specularTexture) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.specularTexture).then((map) => {
          materialParams.specularIntensityMap = map
        })
      )
    }

    const colorArray = extension.specularColorFactor || [1, 1, 1]
    materialParams.specularColor = new Color().setRGB(colorArray[0], colorArray[1], colorArray[2], LinearSRGBColorSpace)

    if (extension?.specularColorTexture) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.specularColorTexture).then((map) => {
          materialParams.specularColorMap = map
          if (map) map.colorSpace = SRGBColorSpace
        })
      )
    }

    return Promise.all(pending)
  },

  exportMaterialExtension(materialValues: Record<string, MaterialValue>) {
    const extension = {} as MaterialExtension<typeof KHRSpecularExtensionComponent>
    if (materialValues.specularIntensity != undefined) {
      extension.specularFactor = materialValues.specularIntensity.contents
      delete materialValues.specularIntensity
    }
    if (materialValues.specularIntensityMap != undefined) {
      extension.specularTexture = materialValues.specularIntensityMap.contents
      delete materialValues.specularIntensityMap
    }
    if (materialValues.specularColor != undefined) {
      extension.specularColorFactor = colorValueToTupleValue(materialValues.specularColor as MaterialColorValue)
      delete materialValues.specularColor
    }
    if (materialValues.specularColorMap != undefined) {
      extension.specularColorTexture = materialValues.specularColorMap.contents
      delete materialValues.specularColorMap
    }

    return extension
  }
})

/**
 * Materials bump Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/EXT_materials_bump
 */
export const EXTBumpExtensionComponent = defineComponent({
  name: 'EXTBumpExtensionComponent',
  jsonID: 'EXT_materials_bump',
  schema: Schema.Object({
    bumpFactor: Schema.Optional(Schema.Number()),
    bumpTexture: Schema.Optional(TextureInfoSchema)
  }),

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![EXTBumpExtensionComponent.jsonID] as ComponentType<
      typeof EXTBumpExtensionComponent
    >
    materialParams.bumpScale = extension.bumpFactor != undefined ? extension.bumpFactor : 1.0

    if (extension.bumpTexture != undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.bumpTexture).then((map) => {
          materialParams.bumpMap = map
        })
      )
    }

    return Promise.all(pending)
  },

  exportMaterialExtension(materialValues: Record<string, MaterialValue>) {
    const extension = {} as MaterialExtension<typeof EXTBumpExtensionComponent>
    if (materialValues.bumpScale != undefined) {
      extension.bumpFactor = materialValues.bumpScale.contents
      delete materialValues.bumpScale
    }
    if (materialValues.bumpMap != undefined) {
      if (materialValues.bumpMap.contents != undefined) extension.bumpTexture = materialValues.bumpMap.contents
      delete materialValues.bumpMap
    }

    return extension
  }
})

/**
 * Materials anisotropy Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_anisotropy
 */
export const KHRAnisotropyExtensionComponent = defineComponent({
  name: 'KHRAnisotropyExtensionComponent',
  jsonID: 'KHR_materials_anisotropy',
  schema: Schema.Object({
    anisotropyStrength: Schema.Optional(Schema.Number()),
    anisotropyRotation: Schema.Optional(Schema.Number()),
    anisotropyTexture: Schema.Optional(TextureInfoSchema)
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![KHRAnisotropyExtensionComponent.jsonID] as ComponentType<
      typeof KHRAnisotropyExtensionComponent
    >
    if (extension.anisotropyStrength != undefined) {
      materialParams.anisotropy = extension.anisotropyStrength
    }

    if (extension.anisotropyRotation != undefined) {
      materialParams.anisotropyRotation = extension.anisotropyRotation
    }

    if (extension.anisotropyTexture != undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.anisotropyTexture).then((map) => {
          materialParams.anisotropyMap = map
        })
      )
    }

    return Promise.all(pending)
  },

  exportMaterialExtension(materialValues: Record<string, MaterialValue>) {
    const extension = {} as MaterialExtension<typeof KHRAnisotropyExtensionComponent>
    if (materialValues.anisotropy != undefined) {
      extension.anisotropyStrength = materialValues.anisotropy.contents
      delete materialValues.anisotropy
    }
    if (materialValues.anisotropyRotation != undefined) {
      extension.anisotropyRotation = materialValues.anisotropyRotation.contents
      delete materialValues.anisotropyRotation
    }
    if (materialValues.anisotropyMap != undefined) {
      extension.anisotropyTexture = materialValues.anisotropyMap.contents
      delete materialValues.anisotropyMap
    }

    return extension
  }
})

type GLTFTextureTransformExtensionType = {
  texCoord?: number
  offset?: [number, number]
  rotation?: number
  scale?: [number, number]
}

/**
 * Texture Transform Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
 */
export const KHRTextureTransformExtensionComponent = defineComponent({
  name: 'KHRTextureTransformExtensionComponent',
  jsonID: 'KHR_texture_transform',

  schema: Schema.Object({
    offset: Schema.Optional(Schema.Tuple([Schema.Number(), Schema.Number()])),
    rotation: Schema.Optional(Schema.Number()),
    scale: Schema.Optional(Schema.Tuple([Schema.Number(), Schema.Number()])),
    texCoord: Schema.Optional(Schema.Number())
  }),

  extendTexture: (texture: Texture, transform: GLTFTextureTransformExtensionType) => {
    if (
      (transform.texCoord === undefined || transform.texCoord === texture.channel) &&
      transform.offset === undefined &&
      transform.rotation === undefined &&
      transform.scale === undefined
    ) {
      // See https://github.com/mrdoob/three.js/issues/21819.
      return texture
    }

    /** @todo this throws hookstate 109... */
    // texture = texture.clone()

    if (transform.texCoord != undefined) {
      texture.channel = transform.texCoord
    }

    if (transform.offset != undefined) {
      texture.offset.fromArray(transform.offset)
    }

    if (transform.rotation != undefined) {
      texture.rotation = transform.rotation
    }

    if (transform.scale != undefined) {
      texture.repeat.fromArray(transform.scale)
    }

    texture.needsUpdate = true

    return texture
  },

  exportTextureExtension(texture: Texture) {
    const extension = {} as GLTFTextureTransformExtensionType

    if (texture.channel) {
      extension.texCoord = texture.channel
    }
    if (!texture.offset.equals(Vector2_Zero)) {
      extension.offset = [texture.offset.x, texture.offset.y]
    }
    if (texture.rotation) {
      extension.rotation = texture.rotation
    }
    if (!texture.repeat.equals(Vector2_One)) {
      extension.scale = [texture.repeat.x, texture.repeat.y]
    }

    return extension
  }
})

export const MozillaHubsLightMapComponent = defineComponent({
  name: 'MozillaHubsLightMapComponent',
  jsonID: 'MOZ_lightmap',
  schema: Schema.Object({
    index: Schema.Number({ default: 1 }),
    intensity: Schema.Number({ default: 1.0 })
  }),

  extendMaterialParams(
    options: GLTFParserOptions,
    materialParams: any,
    materialDef: GLTF.IMaterial,
    materialIndex: number
  ) {
    const pending = [] as Promise<any>[]

    const extensionDef = materialDef.extensions![MozillaHubsLightMapComponent.jsonID] as ComponentType<
      typeof MozillaHubsLightMapComponent
    >

    pending.push(
      getDependency(options, 'texture', extensionDef.index).then((result) => {
        const lightMap: Texture = result!.clone()
        lightMap.channel = 1
        materialParams.lightMap = lightMap
        materialParams.lightMapIntensity = extensionDef.intensity ?? 1.0

        getDependency(options, 'material', materialIndex).then((entity) => {
          // fix for change to MeshBasicMaterial shading WRT lightmaps
          /** @todo */
          // const material = getComponent(entity, MaterialComponent, { lightMapIntensity })
          // if (material.type === 'MeshBasicMaterial') {
          //   material.lightMapIntensity *= Math.PI
          // }
        })
      })
    )

    return Promise.all(pending)
  }
})
