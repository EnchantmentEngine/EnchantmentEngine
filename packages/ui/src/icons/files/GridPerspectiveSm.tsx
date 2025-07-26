import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'

const GridPerspectiveSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} transform="rotate(-90 8 8)">
      <path d="M14.667 9.333V12L10.333 12.867M14.667 9.333L1.333 10.667M14.667 9.333V6.667M1.333 10.667V14.667L5.667 13.8M1.333 10.667V5.333M14.667 6.667V4L10.333 3.133M14.667 6.667L1.333 5.333M1.333 5.333V1.333L5.667 2.2M10.333 3.133V12.867M10.333 3.133L5.667 2.2M10.333 12.867L5.667 13.8M5.667 2.2V13.8" />
    </g>
  </svg>
)

const ForwardRef = forwardRef(GridPerspectiveSm)
export default ForwardRef
