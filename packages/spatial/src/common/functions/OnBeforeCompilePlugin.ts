import {
  LineBasicMaterial,
  LineDashedMaterial,
  Material,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshDistanceMaterial,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshNormalMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  PointsMaterial,
  RawShaderMaterial,
  Shader,
  ShaderMaterial,
  ShadowMaterial,
  SpriteMaterial,
  WebGLRenderer
} from 'three'

// Converted to typescript from Fyrestar https://mevedia.com (https://github.com/Fyrestar/OnBeforeCompilePlugin)
// Only implemented the OnBeforeCompile part because OnBeforeRender is not working well with the postprocessing.

export type PluginObjectType = {
  compile: (shader: Shader, renderer: WebGLRenderer) => void
}

export type PluginType = PluginObjectType | typeof Material.prototype.onBeforeCompile

declare module 'three/src/materials/Material.js' {
  export interface Material {
    shader: Shader
    plugins?: PluginType[]
    _onBeforeCompile: typeof Material.prototype.onBeforeCompile
    needsUpdate: boolean
  }
}

const onBeforeCompile = {
  get: function (this: Material) {
    if (!this._onBeforeCompile.toString) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this

      this._onBeforeCompile.toString = function () {
        let code = ''

        if (self.plugins) {
          for (let i = 0, l = self.plugins.length; i < l; i++) {
            const plugin = self.plugins[i]
            code += plugin instanceof Function ? plugin.toString() : plugin.compile.toString()
          }
        }

        return code
      }
    }

    return this._onBeforeCompile
  },
  set: function (this: Material, plugins: PluginType | PluginType[]) {
    if (plugins === null) return
    if (plugins instanceof Array) {
      for (let i = 0, l = plugins.length; i < l; i++) (this as any).onBeforeCompile = plugins[i]
    } else if (plugins instanceof Function || plugins instanceof Object) {
      const plugin = plugins

      if (!this.plugins) this.plugins = []

      this.plugins.unshift(plugin)

      this.customProgramCacheKey = () => {
        let result = this.shader ? this.shader.fragmentShader + this.shader.vertexShader : ''
        if (!this.plugins) return result
        for (let i = 0; i < this.plugins.length; i++) {
          const plugin = this.plugins![i]
          const pluginObj = plugin as PluginObjectType
          if (typeof pluginObj.compile === 'function') result += pluginObj.compile.toString()
          else result += plugin.toString()
        }
        return result
      }
    } else {
      console.error('Invalid type "%s" assigned to onBeforeCompile', typeof plugins)
    }
  }
}

export function overrideOnBeforeCompile() {
  const Materials = [
    ShadowMaterial,
    SpriteMaterial,
    RawShaderMaterial,
    ShaderMaterial,
    PointsMaterial,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    MeshPhongMaterial,
    MeshToonMaterial,
    MeshNormalMaterial,
    MeshLambertMaterial,
    MeshDepthMaterial,
    MeshDistanceMaterial,
    MeshBasicMaterial,
    MeshMatcapMaterial,
    LineDashedMaterial,
    LineBasicMaterial,
    Material
  ]

  for (let i = 0, l = Materials.length; i < l; i++) {
    const Material = Materials[i]

    Material.prototype._onBeforeCompile = function (shader, renderer) {
      if (!this.shader) this.shader = shader
      if (!this.plugins) return

      for (let i = 0, l = this.plugins.length; i < l; i++) {
        const plugin = this.plugins[i]
        ;(plugin instanceof Function ? plugin : plugin.compile).call(this, shader, renderer)
      }
    }
    Material.prototype._onBeforeCompile.toString = null!

    const dispose = Material.prototype.dispose

    Material.prototype.dispose = function () {
      this.onBeforeCompile = null
      dispose.call(this)
    }

    Object.defineProperty(Material.prototype, 'onBeforeCompile', onBeforeCompile)
  }
}
