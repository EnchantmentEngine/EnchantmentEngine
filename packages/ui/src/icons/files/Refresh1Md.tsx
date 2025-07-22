import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Refresh1Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M1.66797 11.6667C1.66797 11.6667 1.76907 12.3744 4.698 15.3033C7.62693 18.2322 12.3757 18.2322 15.3046 15.3033C16.3423 14.2656 17.0124 12.9994 17.3148 11.6667M1.66797 11.6667V16.6667M1.66797 11.6667H6.66797M18.3346 8.33333C18.3346 8.33333 18.2335 7.62563 15.3046 4.6967C12.3757 1.76777 7.62693 1.76777 4.698 4.6967C3.66027 5.73443 2.99021 7.0006 2.68783 8.33333M18.3346 8.33333V3.33333M18.3346 8.33333H13.3346"
    />
  </svg>
)
const ForwardRef = forwardRef(Refresh1Md)
export default ForwardRef
