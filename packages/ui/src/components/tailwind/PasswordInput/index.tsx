import { EyeLg, EyeOffLg } from '@ir-engine/ui/src/icons'
import React, { forwardRef } from 'react'

import { useHookstate } from '@ir-engine/hyperflux'
import Input, { InputProps } from '@ir-engine/ui/src/primitives/tailwind/Input'

const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  (props: InputProps, ref: React.Ref<HTMLInputElement>) => {
    const show = useHookstate(false)

    const toggleShow = () => {
      show.set(!show.value)
    }

    return (
      <Input
        ref={ref}
        {...props}
        type={show.value ? 'text' : 'password'}
        endComponent={
          <button onClick={toggleShow} className="focus:outline-none">
            {show.value ? <EyeOffLg /> : <EyeLg />}
          </button>
        }
      />
    )
  }
)

export default PasswordInput
