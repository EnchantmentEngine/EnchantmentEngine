import { WebRenderer } from '../WebRenderer'
import { getEmbeddedDataURL } from './getEmbeddedDataURL'

/**
 * Matches CSS imports & URLS.
 * For eg: `@import "styles.css"`, `url(image.png)`. Captures the resource in group 2 or group 3.
 */
export const CSS_URL_REGEX = /(@import\s+["']([^"']+)["']|url\((?!['"]?(?:data):)['"]?([^'"\)]+)['"]?\))/gi

export async function getEmbeddedCSS(url: string) {
  if (WebRenderer.embeddedCSSMap.has(url)) return WebRenderer.embeddedCSSMap.get(url)!
  const res = await fetch(url, { mode: 'no-cors', headers: { accept: 'text/css' } })
  const css = await generateEmbeddedCSS(url, await res.text())
  WebRenderer.embeddedCSSMap.set(url, css)
  return WebRenderer.embeddedCSSMap.get(url)!
}

export async function generateEmbeddedCSS(url: string, css: string): Promise<string> {
  let found: RegExpExecArray | null
  const promises = [] as Promise<any>[]

  // Add classes for psuedo-classes
  css = css.replaceAll(':hover', WebRenderer.attributeCSS(WebRenderer.HOVER_ATTRIBUTE))
  css = css.replaceAll(':active', WebRenderer.attributeCSS(WebRenderer.ACTIVE_ATTRIBUTE))
  css = css.replaceAll(':focus', WebRenderer.attributeCSS(WebRenderer.FOCUS_ATTRIBUTE))
  css = css.replaceAll(':target', WebRenderer.attributeCSS(WebRenderer.TARGET_ATTRIBUTE))

  const matches = css.matchAll(CSS_URL_REGEX)

  for (const match of matches) {
    const isCSSImport = !!match[2]
    const accept = isCSSImport ? 'type/css' : undefined
    const resourceURL = match[2] || match[3]
    promises.push(
      getEmbeddedDataURL(new URL(resourceURL, url).href, accept).then((dataURL) => {
        css = css.replace(resourceURL, dataURL)
      })
    )
  }

  await Promise.all(promises)
  return css
}
