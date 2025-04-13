/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

/**
 * https://github.com/vitejs/vite/issues/2483#issuecomment-1912618966
 */

import fs from 'fs'
import path from 'path'
import type { Plugin } from 'vite'

/**
 * Defines the document's import maps.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap}
 * @see {@link https://github.com/vitejs/vite/issues/2483}
 */
export default (command: 'build' | 'serve', entries: { [key: string]: string }): Plugin => {
  fs.writeFileSync(
    path.resolve(__dirname, '../public/importmap.json'),
    JSON.stringify({
      imports: entries
    })
  )

  return {
    name: 'importMap',
    // config: () => {
    //   const config: UserConfig = {
    //     optimizeDeps: {
    //       // entries: Object.values(entries),
    //       /**
    //        * Specify the entry points for pre-optimization.
    //        */
    //       // include: Object.values(entries),
    //       exclude: [...Object.keys(entries), ...Object.values(entries)]
    //     },
    //     build: {
    //       rollupOptions: {
    //         // external: Object.keys(entries),
    //         /**
    //          * Specify the entry points for the import map. Points to the original files.
    //          */
    //         input: Object.fromEntries(
    //           Object.entries(entries).concat([['main', path.resolve(appRootPath.path, 'packages/client/index.html')]])
    //         ),
    //         /**
    //          * Specify the output files for the import map. Points to the bundled files.
    //          */
    //         output: {
    //           entryFileNames: 'entry/[name].js'
    //         }
    //       }
    //     }
    //   }

    //   return config
    // },
    // transformIndexHtml: (html) => {
    //   /**
    //    * When in development mode, the import map should point to the original files.
    //    * When in production mode, it should point to the bundled files.
    //    */
    //   const content = Object.entries(entries)
    //     .map(([from, to]) => (command === 'build' ? `"${from}":"/entry/${from}.js"` : `"${from}":"${to}"`))
    //     .join(',')
    //   return html.replace(/^(\s*?)<title>.*?<\/title>/m, `$&$1<script type="importmap">{"imports":{${content}}}</script>`)
    // },
    transform(code, id, options) {
      for (const [from, to] of Object.entries(entries)) {
        if (id.endsWith(from + '/xrengine.config.ts')) {
          console.log('\n\ntransform:', code, id, options, '\n\n')
          return code
        }
      }
    }
    // load(id) {
    //   for (const [from, to] of Object.entries(entries)) {
    //     if (id.endsWith(from + '/xrengine.config.ts')) {
    //       console.log('load:', id)
    //       return {
    //         code: `export * from '@${from}/xrengine.config.ts';`,
    //         map: null
    //       }
    //     }
    //   }
    // }
  }
}
