import Toggle from '@ir-engine/ui/src/components/viewer/Toggle'
import React from 'react'

interface ToggleItemProps extends React.PropsWithChildren {
  label?: string
  checked?: boolean
  onClick?: () => void
}

const ToggleItem: React.FC<ToggleItemProps> = ({ label, checked = false, onClick, children }) => {
  return (
    <div className="flex items-center justify-between bg-black/10 px-4 py-3.5 text-white/90">
      {children || <span className="text-base font-medium">{label}</span>}
      <Toggle checked={checked} onChange={onClick} />
    </div>
  )
}

export default ToggleItem
