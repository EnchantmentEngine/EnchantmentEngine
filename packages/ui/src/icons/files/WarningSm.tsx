import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const WarningSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 16"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#2C2E33"
      fillRule="evenodd"
      d="M6.267 2.002c.77-1.334 2.695-1.334 3.465 0l4.903 8.499c.77 1.333-.193 2.999-1.732 2.999H3.097c-1.54 0-2.502-1.666-1.733-3zM8 5.5a.5.5 0 0 1 .5.5v2.5a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5M8 11a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(WarningSm)
export default ForwardRef
