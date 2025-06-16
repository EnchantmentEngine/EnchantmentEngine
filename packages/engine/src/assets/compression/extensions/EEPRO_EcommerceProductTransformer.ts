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

const EXTENSION_NAME = 'EEPRO_ecommerce_product'

interface IEEPROEcommerceProduct extends IProperty {
  provider: string
  productId: string
  label: string
  variantId: string
  freezeXaxis: boolean
  freezeYaxis: boolean
  size: number
  activationDistance: number
  useOverlay: boolean
  xOffset: number
  yOffset: number
  gltfSources: string[]
  mediaSources: string[]
  featuredMediaSource: string
}

export class EEPROEcommerceProduct extends ExtensionProperty<IEEPROEcommerceProduct> {
  public static EXTENSION_NAME = EXTENSION_NAME
  public declare extensionName: typeof EXTENSION_NAME
  public declare propertyType: 'EEPROEcommerceProduct'
  public declare parentTypes: [PropertyType.NODE]

  protected init(): void {
    this.extensionName = EXTENSION_NAME
    this.propertyType = 'EEPROEcommerceProduct'
    this.parentTypes = [PropertyType.NODE]
  }

  protected getDefaults(): Nullable<IEEPROEcommerceProduct> {
    return Object.assign(super.getDefaults() as IProperty, {
      provider: 'shopify',
      productId: '',
      label: 'E',
      variantId: '',
      freezeXaxis: false,
      freezeYaxis: false,
      size: 0.5,
      activationDistance: 2,
      useOverlay: true,
      xOffset: 0,
      yOffset: 0,
      gltfSources: [],
      mediaSources: [],
      featuredMediaSource: ''
    })
  }

  public get provider() {
    return this.get('provider')
  }
  public set provider(val: string) {
    this.set('provider', val)
  }

  public get productId() {
    return this.get('productId')
  }
  public set productId(val: string) {
    this.set('productId', val)
  }

  public get label() {
    return this.get('label')
  }
  public set label(val: string) {
    this.set('label', val)
  }

  public get variantId() {
    return this.get('variantId')
  }
  public set variantId(val: string) {
    this.set('variantId', val)
  }

  public get freezeXaxis() {
    return this.get('freezeXaxis')
  }
  public set freezeXaxis(val: boolean) {
    this.set('freezeXaxis', val)
  }

  public get freezeYaxis() {
    return this.get('freezeYaxis')
  }
  public set freezeYaxis(val: boolean) {
    this.set('freezeYaxis', val)
  }

  public get size() {
    return this.get('size')
  }
  public set size(val: number) {
    this.set('size', val)
  }

  public get activationDistance() {
    return this.get('activationDistance')
  }
  public set activationDistance(val: number) {
    this.set('activationDistance', val)
  }

  public get useOverlay() {
    return this.get('useOverlay')
  }
  public set useOverlay(val: boolean) {
    this.set('useOverlay', val)
  }

  public get xOffset() {
    return this.get('xOffset')
  }
  public set xOffset(val: number) {
    this.set('xOffset', val)
  }

  public get yOffset() {
    return this.get('yOffset')
  }
  public set yOffset(val: number) {
    this.set('yOffset', val)
  }

  public get gltfSources() {
    return this.get('gltfSources')
  }
  public set gltfSources(val: string[]) {
    this.set('gltfSources', val)
  }

  public get mediaSources() {
    return this.get('mediaSources')
  }
  public set mediaSources(val: string[]) {
    this.set('mediaSources', val)
  }

  public get featuredMediaSource() {
    return this.get('featuredMediaSource')
  }
  public set featuredMediaSource(val: string) {
    this.set('featuredMediaSource', val)
  }
}

export class EEPROEcommerceProductExtension extends CopyableExtension {
  public readonly extensionName: string = EXTENSION_NAME
  public static readonly EXTENSION_NAME: string = EXTENSION_NAME

  public read(readerContext: ReaderContext): this {
    const nodeDefs = readerContext.jsonDoc.json.nodes || []
    nodeDefs.forEach((def, idx) => {
      if (def.extensions?.[EXTENSION_NAME]) {
        const ecommerceProduct = new EEPROEcommerceProduct(this.document.getGraph())
        readerContext.nodes[idx].setExtension(EXTENSION_NAME, ecommerceProduct)

        const eeDef = def.extensions[EXTENSION_NAME] as Partial<IEEPROEcommerceProduct>

        if (eeDef.provider) ecommerceProduct.provider = eeDef.provider
        if (eeDef.productId) ecommerceProduct.productId = eeDef.productId
        if (eeDef.label) ecommerceProduct.label = eeDef.label
        if (eeDef.variantId) ecommerceProduct.variantId = eeDef.variantId
        if (typeof eeDef.freezeXaxis === 'boolean') ecommerceProduct.freezeXaxis = eeDef.freezeXaxis
        if (typeof eeDef.freezeYaxis === 'boolean') ecommerceProduct.freezeYaxis = eeDef.freezeYaxis
        if (typeof eeDef.size === 'number') ecommerceProduct.size = eeDef.size
        if (typeof eeDef.activationDistance === 'number') ecommerceProduct.activationDistance = eeDef.activationDistance
        if (typeof eeDef.useOverlay === 'boolean') ecommerceProduct.useOverlay = eeDef.useOverlay
        if (typeof eeDef.xOffset === 'number') ecommerceProduct.xOffset = eeDef.xOffset
        if (typeof eeDef.yOffset === 'number') ecommerceProduct.yOffset = eeDef.yOffset
        if (Array.isArray(eeDef.gltfSources)) ecommerceProduct.gltfSources = eeDef.gltfSources
        if (Array.isArray(eeDef.mediaSources)) ecommerceProduct.mediaSources = eeDef.mediaSources
        if (eeDef.featuredMediaSource) ecommerceProduct.featuredMediaSource = eeDef.featuredMediaSource
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
        const ecommerceProduct = node.getExtension<EEPROEcommerceProduct>(EXTENSION_NAME)
        if (ecommerceProduct) {
          const nodeIdx = writerContext.nodeIndexMap.get(node)!
          const nodeDef = json.json.nodes![nodeIdx]
          nodeDef.extensions = nodeDef.extensions || {}

          nodeDef.extensions[EXTENSION_NAME] = {
            provider: ecommerceProduct.provider,
            productId: ecommerceProduct.productId,
            label: ecommerceProduct.label,
            variantId: ecommerceProduct.variantId,
            freezeXaxis: ecommerceProduct.freezeXaxis,
            freezeYaxis: ecommerceProduct.freezeYaxis,
            size: ecommerceProduct.size,
            activationDistance: ecommerceProduct.activationDistance,
            useOverlay: ecommerceProduct.useOverlay,
            xOffset: ecommerceProduct.xOffset,
            yOffset: ecommerceProduct.yOffset,
            gltfSources: ecommerceProduct.gltfSources,
            mediaSources: ecommerceProduct.mediaSources,
            featuredMediaSource: ecommerceProduct.featuredMediaSource
          }
        }
      })
    return this
  }

  public copyTo(target: Extension | null): void {
    if (!target || !(target instanceof EEPROEcommerceProductExtension)) return

    // No specific data to copy in this case as ecommerce product data is per-node
  }
}
