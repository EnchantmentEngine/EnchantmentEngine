import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SuccessMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M1.5 10a8.5 8.5 0 1 1 17 0 8.5 8.5 0 0 1-17 0m11.647-1.582a.654.654 0 1 0-1.064-.76l-2.82 3.95-1.416-1.417a.654.654 0 1 0-.925.925l1.962 1.962a.654.654 0 0 0 .994-.083z"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(SuccessMd)
export default ForwardRef
