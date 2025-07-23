import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MouseRightClickLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 2a7 7 0 0 0-7 7v6a7 7 0 1 0 14 0V9m-7-7a7 7 0 0 1 7 7m-7-7v7h7"
    />
    <path fill="#F7F8FA" d="M12.5 8.5V2s2.677.647 4 1.5c1.767 1.14 2 5 2 5z" />
  </svg>
)
const ForwardRef = forwardRef(MouseRightClickLg)
export default ForwardRef
