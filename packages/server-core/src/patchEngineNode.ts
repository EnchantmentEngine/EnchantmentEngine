/**
 * Required for nodejs environments (servers), and test environments that do not target jsdom
 */

import 'jsdom-global/register'

/** Ensure hookstate is always imported first and overrides react */
import '@ir-engine/hyperflux'

import { Blob } from 'buffer'
import fetch, { Headers, Request, Response } from 'node-fetch'

/**
 * JSDOM's fetch does not work properly, so we need to replace it with node-fetch
 */
globalThis.fetch = fetch as any
globalThis.Request = Request as any
globalThis.Response = Response as any
globalThis.Headers = Headers as any

globalThis.self = globalThis as Window & typeof globalThis

globalThis.Blob = Blob as any

// @ts-ignore
if (!URL.createObjectURL) URL.createObjectURL = () => {}
if (!URL.revokeObjectURL) URL.revokeObjectURL = () => {}
