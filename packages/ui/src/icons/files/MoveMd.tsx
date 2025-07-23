import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MoveMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g clipPath="url(#prefix__a)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M4.16602 7.50033L1.66602 10.0003M1.66602 10.0003L4.16602 12.5003M1.66602 10.0003H18.3327M7.49935 4.16699L9.99935 1.66699M9.99935 1.66699L12.4993 4.16699M9.99935 1.66699V18.3337M12.4993 15.8337L9.99935 18.3337M9.99935 18.3337L7.49935 15.8337M15.8327 7.50033L18.3327 10.0003M18.3327 10.0003L15.8327 12.5003"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(MoveMd)
export default ForwardRef
