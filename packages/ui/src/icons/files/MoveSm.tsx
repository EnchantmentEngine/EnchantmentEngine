import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MoveSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g clipPath="url(#prefix__a)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3.33398 5.99967L1.33398 7.99967M1.33398 7.99967L3.33398 9.99967M1.33398 7.99967H14.6673M6.00065 3.33301L8.00065 1.33301M8.00065 1.33301L10.0007 3.33301M8.00065 1.33301V14.6663M10.0007 12.6663L8.00065 14.6663M8.00065 14.6663L6.00065 12.6663M12.6673 5.99967L14.6673 7.99967M14.6673 7.99967L12.6673 9.99967"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(MoveSm)
export default ForwardRef
