import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Cursor03Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M4.71152 3.67397C4.17096 3.46102 3.90067 3.35455 3.72846 3.41184C3.57892 3.46158 3.46158 3.57892 3.41184 3.72846C3.35455 3.90067 3.46102 4.17096 3.67397 4.71152L8.97461 18.167C9.14612 18.6024 9.23188 18.82 9.37164 18.9074C9.49348 18.9836 9.64219 19.0036 9.77986 18.9625C9.93778 18.9153 10.0782 18.7281 10.3589 18.3538L12.4996 15.4996L15.9489 20.2424C16.1385 20.5032 16.2334 20.6335 16.3542 20.688C16.4602 20.7359 16.5796 20.7452 16.6918 20.7145C16.8196 20.6795 16.9336 20.5655 17.1616 20.3376L20.3376 17.1616C20.5655 16.9336 20.6795 16.8196 20.7145 16.6918C20.7452 16.5796 20.7359 16.4602 20.688 16.3542C20.6335 16.2334 20.5032 16.1385 20.2424 15.9489L15.4996 12.4996L18.3538 10.3589C18.7281 10.0782 18.9153 9.93778 18.9625 9.77986C19.0036 9.64219 18.9836 9.49348 18.9074 9.37164C18.82 9.23188 18.6024 9.14612 18.167 8.97461L4.71152 3.67397Z"
    />
  </svg>
)
const ForwardRef = forwardRef(Cursor03Lg)
export default ForwardRef
