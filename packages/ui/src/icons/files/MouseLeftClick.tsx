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
const MouseLeftClick = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    width="1rem"
    height="1rem"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      d="M8.00065 1.33301C10.578 1.33301 12.6673 3.42235 12.6673 5.99967V9.99967C12.6673 12.577 10.578 14.6663 8.00065 14.6663C5.42332 14.6663 3.33398 12.577 3.33398 9.99967V5.99967M8.00065 1.33301C5.42332 1.33301 3.33398 3.42235 3.33398 5.99967M8.00065 1.33301V5.99967L3.33398 5.99967"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M7.66602 5.66634V1.33301C7.66602 1.33301 5.8814 1.76428 4.99935 2.33301C3.82103 3.09277 3.66602 5.66634 3.66602 5.66634H7.66602Z"
      fill="currentColor"
    />
  </svg>
)
const ForwardRef = forwardRef(MouseLeftClick)
export default ForwardRef
