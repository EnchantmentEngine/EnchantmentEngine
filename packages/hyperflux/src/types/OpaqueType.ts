export interface OpaqueType<T extends string> {
  readonly __opaqueType: T
}

export type Opaque<K, T> = T & { readonly __TYPE__: K }
