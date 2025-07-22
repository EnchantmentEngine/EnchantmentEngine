/* global window self */

/** @deprecated use import from @ir-engine/hyperflux instead */
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'

/** @deprecated use import from @ir-engine/hyperflux instead */
/* eslint-disable no-restricted-globals */
const isWebWorker =
  typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope'
/* eslint-enable no-restricted-globals */

/** @deprecated use import from @ir-engine/hyperflux instead */
const isClient =
  typeof process !== 'object' || typeof process.versions !== 'object' || typeof process.versions.node === 'undefined'

/**
 * @see https://github.com/jsdom/jsdom/releases/tag/12.0.0
 * @see https://github.com/jsdom/jsdom/issues/1537
 * @deprecated use import from @ir-engine/hyperflux instead
 */
/* eslint-disable no-undef */
const isJsDom = () =>
  (typeof window !== 'undefined' && window.name === 'nodejs') ||
  navigator.userAgent.includes('Node.js') ||
  navigator.userAgent.includes('jsdom')

export { isBrowser, isClient, isJsDom, isWebWorker }

// ==== //

// https://github.com/flexdinesh/browser-or-node

// ==== //
