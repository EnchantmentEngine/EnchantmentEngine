import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const WarningMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M7.834 2.503c.962-1.668 3.369-1.668 4.331 0l6.129 10.623c.961 1.667-.242 3.75-2.166 3.75H3.871c-1.924 0-3.127-2.084-2.166-3.75zM10 6.875c.345 0 .625.28.625.625v3.125a.625.625 0 0 1-1.25 0V7.5c0-.345.28-.625.625-.625m0 6.875a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(WarningMd)
export default ForwardRef
