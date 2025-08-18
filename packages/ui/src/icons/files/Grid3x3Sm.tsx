import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'

const Grid3x3Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <rect x="2" y="2" width="12" height="12" strokeWidth={1.5} />
      <path d="M6 2v12" />
      <path d="M10 2v12" />
      <path d="M14 2v12" />
      <path d="M2 6h12" />
      <path d="M2 10h12" />
      <path d="M2 14h12" />
    </g>
  </svg>
)

const ForwardRef = forwardRef(Grid3x3Sm)
export default ForwardRef
