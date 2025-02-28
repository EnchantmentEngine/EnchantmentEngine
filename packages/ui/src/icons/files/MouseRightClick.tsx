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
const MouseRightClick = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    width="1rem"
    height="1rem"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      d="M12 2C8.13401 2 5 5.13401 5 9V15C5 18.866 8.13401 22 12 22C15.866 22 19 18.866 19 15V9M12 2C15.866 2 19 5.13401 19 9M12 2V9L19 9"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M12.5 8.5V2C12.5 2 15.1769 2.64691 16.5 3.5C18.2675 4.63964 18.5 8.5 18.5 8.5H12.5Z" fill="currentColor" />
  </svg>
)
const ForwardRef = forwardRef(MouseRightClick)
export default ForwardRef
