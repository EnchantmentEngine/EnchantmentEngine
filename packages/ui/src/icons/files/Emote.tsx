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
const Emote = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        <circle cx={31} cy={32} r={12} stroke="#000" strokeWidth={2} />
        <path
          fill="#000"
          stroke="#000"
          d="M29.5 24.5c-1.2 4.4-7 6.333-9.5 7-.334-4.167 1.34-10.5 10.54-10.5s12.287 5.667 12.787 9c-8.827 1.5-12.66-3.667-13.827-5.5Z"
        />
        <circle cx={27.5} cy={33.5} r={1.5} fill="#000" />
        <circle cx={34.5} cy={33.5} r={1.5} fill="#000" />
        <path
          fill="#000"
          stroke="#fff"
          d="m39 15-1.26 4.344-4.74 1.62 4.74 1.692L39 27l1.407-4.344L45 20.963l-4.593-1.62z"
        />
      </g>
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
const ForwardRef = forwardRef(Emote)
export default ForwardRef
