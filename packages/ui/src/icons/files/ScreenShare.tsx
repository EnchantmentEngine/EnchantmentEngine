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
const ScreenShare = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="M28 41h8m-4-4v4m-5.2-4h10.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C42 34.72 42 33.88 42 32.2v-4.4c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C39.72 23 38.88 23 37.2 23H26.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C22 25.28 22 26.12 22 27.8v4.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C24.28 37 25.12 37 26.8 37"
      />
      <g clipPath="url(#prefix__c)">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M36.555 30.413c.11-.074.165-.11.185-.154a.14.14 0 0 0 0-.118c-.02-.044-.075-.08-.185-.154l-3.812-2.54c-.189-.127-.284-.19-.364-.192a.26.26 0 0 0-.18.065c-.05.048-.05.145-.05.339v1.503c-.96.13-1.84.51-2.493 1.078-.713.62-1.107 1.422-1.107 2.253v.214a5.2 5.2 0 0 1 1.728-1.049 6.3 6.3 0 0 1 1.872-.383v1.466c0 .194 0 .29.05.339.044.042.11.066.18.064.08-.001.175-.064.364-.19z"
        />
      </g>
      <path stroke="#000" d="m29.6 31.4 3-3 3 1.8-3 1.8-1.8-1.2 2.4-1.8 1.2 1.2-2.4.6 1.2-1.2" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h64v64H0z" />
      </clipPath>
      <clipPath id="prefix__b">
        <path fill="#fff" d="M0 0h64v64H0z" />
      </clipPath>
      <clipPath id="prefix__c">
        <path fill="#fff" d="M27.2 26H38v8.4H27.2z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(ScreenShare)
export default ForwardRef
