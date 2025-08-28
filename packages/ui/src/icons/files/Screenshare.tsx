import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Screenshare = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      strokeWidth={1.75}
      d="M8 21h8m-4-4v4m-5.2-4h10.4c1.68 0 2.52 0 3.161-.327a3 3 0 0 0 1.311-1.311C22 14.72 22 13.88 22 12.2V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.31-1.311C19.72 3 18.878 3 17.198 3H6.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.31 1.311c-.328.642-.328 1.482-.328 3.162v4.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C4.28 17 5.12 17 6.8 17"
    />
    <g clipPath="url(#prefix__a)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.556 10.413c.11-.074.165-.11.185-.154a.14.14 0 0 0 0-.118c-.02-.044-.075-.08-.185-.154l-3.812-2.54c-.189-.127-.283-.19-.364-.192a.26.26 0 0 0-.18.065c-.05.048-.05.145-.05.339v1.503c-.96.13-1.84.51-2.493 1.078-.713.62-1.107 1.422-1.107 2.253v.214a5.2 5.2 0 0 1 1.728-1.049 6.3 6.3 0 0 1 1.872-.383v1.466c0 .194 0 .29.05.339.045.042.11.066.18.064.08-.001.175-.064.364-.19z"
      />
    </g>
    <path stroke="#000" d="m9.6 11.4 3-3 3 1.8-3 1.8-1.8-1.2L13.2 9l1.2 1.2-2.4.6 1.2-1.2" />
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M7.2 6H18v8.4H7.2z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Screenshare)
export default ForwardRef
