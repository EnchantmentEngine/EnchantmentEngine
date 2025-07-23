import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const EmoteSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 15 16"
    role="img"
    ref={ref}
    {...props}
  >
    <g fill="currentColor">
      <path
        fillRule="evenodd"
        d="m9.75 1.826-2.06.703 3.217 1.149.854 2.946.923-2.848a7.298 7.298 0 1 1-2.934-1.95M7.298 14.877a6.176 6.176 0 0 0 6.093-7.189c-4.37.406-6.318-2.227-6.935-3.197-.673 2.467-3.92 3.552-5.327 3.928a6.175 6.175 0 0 0 6.17 6.458M6.175 9.544a.842.842 0 1 1-1.684 0 .842.842 0 0 1 1.684 0m3.088.842a.842.842 0 1 0 0-1.684.842.842 0 0 0 0 1.684"
        clipRule="evenodd"
      />
      <path d="m11.79 0-.53 1.829-1.996.682 1.996.713.53 1.829.593-1.83 1.933-.712-1.933-.682z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(EmoteSm)
export default ForwardRef
