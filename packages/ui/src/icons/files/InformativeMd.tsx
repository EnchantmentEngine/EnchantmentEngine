import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const InformativeMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#2C2E33"
      fillRule="evenodd"
      d="M1.5 10a8.5 8.5 0 1 1 17 0 8.5 8.5 0 0 1-17 0M10 6.73c.361 0 .654.294.654.655v3.269a.654.654 0 1 1-1.308 0v-3.27c0-.36.293-.653.654-.653m0 7.193a.654.654 0 1 0 0-1.308.654.654 0 0 0 0 1.308"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(InformativeMd)
export default ForwardRef
