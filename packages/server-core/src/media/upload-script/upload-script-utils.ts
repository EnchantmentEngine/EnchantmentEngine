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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import * as ts from 'typescript'

/**
 * Registry of disallowed features in scripts for security purposes
 * Each entry contains a pattern to match and a reason for disallowing
 */
export const DISALLOWED_FEATURES = [
  {
    pattern: /\bfetch\s*\(/g,
    reason: 'Network requests using fetch() are not allowed for security reasons'
  },
  {
    pattern: /\bwindow\.fetch\s*\(/g,
    reason: 'Network requests using window.fetch() are not allowed for security reasons'
  },
  {
    pattern: /\bglobalThis\.fetch\s*\(/g,
    reason: 'Network requests using globalThis.fetch() are not allowed for security reasons'
  },
  {
    pattern: /\bnew\s+XMLHttpRequest\s*\(/g,
    reason: 'Network requests using XMLHttpRequest are not allowed for security reasons'
  },
  {
    pattern: /\bdocument\.cookie\b/g,
    reason: 'Access to document.cookie is not allowed for security reasons'
  },
  {
    pattern: /\blocalStorage\b/g,
    reason: 'Access to localStorage is not allowed for security reasons'
  },
  {
    pattern: /\bsessionStorage\b/g,
    reason: 'Access to sessionStorage is not allowed for security reasons'
  },
  {
    pattern: /\beval\s*\(/g,
    reason: 'Use of eval() is not allowed for security reasons'
  },
  {
    pattern: /\bFunction\s*\(\s*["'`].*["'`]\s*\)/g,
    reason: 'Dynamic function creation is not allowed for security reasons'
  }
]

/**
 * Validates script content against disallowed features
 * @param scriptContent The script content to validate
 * @returns An array of validation errors, empty if valid
 */
export const validateScript = (scriptContent: string): { pattern: RegExp; reason: string }[] => {
  return DISALLOWED_FEATURES.filter(({ pattern }) => pattern.test(scriptContent))
}

/**
 * Transpiles TypeScript code to JavaScript
 * @param source TypeScript source code
 * @param fileName Original file name (for source maps)
 * @returns Transpiled JavaScript code
 */
export const transpileTypeScript = (source: string, fileName: string): string => {
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Node16, // Using Node16 instead of deprecated NodeJs
      esModuleInterop: true,
      sourceMap: true,
      jsx: ts.JsxEmit.React,
      allowJs: true,
      removeComments: false
    },
    fileName
  })

  return result.outputText
}

/**
 * Takes a shallow module import and replace it with a global reference deconstructor
 * Example:
 *
 *      import { x } from '@ir-engine/spatial'
 *            becomes
 *      const { x } = globalThis.__MODULES__.ir.spatial
 *
 *      import { Color } from 'three'
 *            becomes
 *      const { Color } = globalThis.__MODULES__.THREE
 *
 * @param text The script text to process
 * @param importStatement The import statement to replace
 * @param globalName The global name to use in the replacement
 * @returns The processed script text
 */
export const convertImportToGlobal = (text: string, importStatement: string, globalName: string): string => {
  const importRegex = new RegExp(`import\\s+({[^}]+})\\s+from\\s+['"]${importStatement}['"]`, 'g')
  return text.replace(importRegex, `const $1 = globalThis.__MODULES__.${globalName}`)
}
