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
const Chat = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        strokeWidth={2}
        d="M27 28.5h5M27 32h8m-5.316 6H36.2c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C41 35.72 41 34.88 41 33.2v-5.4c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C38.72 23 37.88 23 36.2 23h-8.4c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C23 25.28 23 26.12 23 27.8v12.536c0 .532 0 .799.11.936a.5.5 0 0 0 .39.188c.176 0 .384-.167.8-.5l2.385-1.908c.488-.39.731-.585 1.003-.724q.362-.184.761-.267c.299-.061.61-.061 1.235-.061"
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
const ForwardRef = forwardRef(Chat)
export default ForwardRef
