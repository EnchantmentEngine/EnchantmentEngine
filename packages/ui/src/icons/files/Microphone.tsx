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

import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Microphone = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 64 64"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <g clipPath="url(#prefix__a)">
      <g clipPath="url(#prefix__b)">
        <circle cx={32} cy={32} r={32} fill="#fff" />
      </g>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M38.483 30.6v1.9q0 .508-.075.994M24.935 30.6v1.9c0 3.673 3.033 6.65 6.774 6.65m0 0V42m0-2.85a6.82 6.82 0 0 0 4.93-2.09M27.838 42h7.742M41 39.91l-6.768-6m2.407 3.15c.414-.43.01-.041.296-.57zm-2.026-6.65v-4.56c0-1.574-1.3-2.85-2.904-2.85a2.9 2.9 0 0 0-2.758 1.957m5.281 8.953L23 23.95l5.806 5.13v3.42c0 1.574 1.3 2.85 2.903 2.85 1.08 0 2.024-.58 2.523-1.44"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h64v64H0z" />
      </clipPath>
      <clipPath id="prefix__b">
        <path fill="#fff" d="M0 0h64v64H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Microphone)
export default ForwardRef
