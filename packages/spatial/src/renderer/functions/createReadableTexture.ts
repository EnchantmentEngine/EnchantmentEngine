import {
  Camera,
  CompressedTexture,
  CubeTexture,
  Mesh,
  NoColorSpace,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  Uniform,
  Vector4,
  WebGLRenderer
} from 'three'

export type BlitTextureOptions = {
  maxDimensions?: { width: number; height: number }
  keepTransform?: boolean
  flipX?: boolean
  flipY?: boolean
}
let canvas: HTMLCanvasElement

function initializeTemporaryRenderer() {
  if (!canvas) {
    canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas') as HTMLCanvasElement
    canvas.style.display = 'block'
  }
  return new WebGLRenderer({ antialias: false, canvas })
}

let blitMaterial: ShaderMaterial
let temporaryCam: Camera

function initializeTemporaryScene() {
  const fullscreenQuadGeometry = new PlaneGeometry(2, 2, 1, 1)
  blitMaterial = new ShaderMaterial({
    uniforms: {
      blitTexture: new Uniform(null),
      flipX: new Uniform(false),
      flipY: new Uniform(false),
      scaleOffset: new Uniform(new Vector4(1, 1, 0, 0))
    },
    vertexShader: `
            varying vec2 vUv;
            void main(){
                vUv = uv;
                gl_Position = vec4(position.xy * 1.0,0.,.999999);
            }`,
    fragmentShader: `
            uniform sampler2D blitTexture; 
            uniform bool flipX;
            uniform bool flipY;
            uniform vec4 scaleOffset;
            varying vec2 vUv;
            void main(){ 
                vec2 uv = vUv * scaleOffset.xy + scaleOffset.zw;
                if (flipX) uv.x *= -1.;
                if (flipY) uv.y *= -1.;
                gl_FragColor = texture2D( blitTexture, uv );
            }`
  })

  const fullscreenQuad = new Mesh(fullscreenQuadGeometry, blitMaterial)
  fullscreenQuad.frustumCulled = false

  temporaryCam = new PerspectiveCamera()
  const temporaryScene = new Scene()
  temporaryScene.add(fullscreenQuad)
  return temporaryScene
}

export async function blitTexture(map: Texture, options?: BlitTextureOptions | undefined) {
  let blit: Texture = map.clone()
  if ((map as CubeTexture).isCubeTexture) {
    blit = new Texture(map.source.data[0])
  }
  // set color space to no color space to avoid any correction
  blit.colorSpace = NoColorSpace

  const temporaryRenderer = initializeTemporaryRenderer()
  const temporaryScene = initializeTemporaryScene()
  if (options?.keepTransform) {
    blitMaterial.uniforms['scaleOffset'].value = new Vector4(
      blit.repeat.x,
      -blit.repeat.y,
      blit.offset.x,
      1 - blit.offset.y
    )
  } else {
    blitMaterial.uniforms['scaleOffset'].value = new Vector4(1, 1, 0, 0)
  }
  blitMaterial.uniforms['blitTexture'].value = blit
  blitMaterial.uniforms['flipX'].value = options?.flipX ?? false
  blitMaterial.uniforms['flipY'].value = options?.flipY ?? false
  blitMaterial.uniformsNeedUpdate = true
  const maxDimensions = options?.maxDimensions
  if (maxDimensions) {
    temporaryRenderer.setSize(
      Math.min(map.image.width, maxDimensions.width),
      Math.min(map.image.height, maxDimensions.height)
    )
  } else {
    temporaryRenderer.setSize(map.image.width, map.image.height)
  }
  temporaryRenderer.clear()
  temporaryRenderer.render(temporaryScene, temporaryCam)
  if (blit !== map) {
    blit.dispose()
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    (temporaryRenderer.domElement.getContext('webgl2')!.canvas as HTMLCanvasElement).toBlob(resolve)
  )

  temporaryRenderer.dispose()

  if (blob) {
    return blob
  }
}

export default async function createReadableTexture(
  map: Texture | CompressedTexture,
  options?: {
    url?: boolean
    canvas?: boolean
  } & BlitTextureOptions
): Promise<Texture | string> {
  if (
    map instanceof CompressedTexture &&
    map.isCompressedTexture &&
    typeof map.source?.data?.src === 'string' &&
    !/ktx2$/.test(map.source.data.src)
  ) {
    return options?.url ? map.source.data.src : map
  }
  const result = await blitTexture(map, options)
  if (!result) throw new Error('Error creating blob')
  const image = new Image(map.image.width, map.image.height)
  image.src = URL.createObjectURL(result)
  await new Promise<void>((resolve) => {
    image.onload = () => resolve()
  })
  if (options?.url) return image.src
  let finalTexture: Texture
  if (options?.canvas) {
    const canvas = document.createElement('canvas')
    canvas.width = map.image.width
    canvas.height = map.image.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image, 0, 0)
    finalTexture = new Texture(canvas)
  } else {
    finalTexture = new Texture(image)
  }
  if (!options?.keepTransform) {
    finalTexture.offset = map.offset
    finalTexture.repeat = map.repeat
    finalTexture.rotation = map.rotation
  }
  finalTexture.wrapS = map.wrapS
  finalTexture.wrapT = map.wrapT
  finalTexture.colorSpace = map.colorSpace
  return finalTexture
}
