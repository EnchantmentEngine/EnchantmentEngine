import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MouseLeftClickSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8 1.333A4.667 4.667 0 0 1 12.668 6v4a4.667 4.667 0 1 1-9.333 0V6m4.667-4.667A4.667 4.667 0 0 0 3.334 6m4.667-4.667V6H3.334"
    />
    <path fill="#F7F8FA" d="M7.666 5.667V1.333s-1.785.432-2.667 1c-1.178.76-1.333 3.334-1.333 3.334z" />
  </svg>
)
const ForwardRef = forwardRef(MouseLeftClickSm)
export default ForwardRef
