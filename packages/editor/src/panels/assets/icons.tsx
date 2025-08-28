import { BsStars } from 'react-icons/bs'
import { FaRegCircle } from 'react-icons/fa6'
import { FiSun } from 'react-icons/fi'
import { LuWaves } from 'react-icons/lu'
import { PiMountains } from 'react-icons/pi'
import { RxCube } from 'react-icons/rx'
import { TbRoute } from 'react-icons/tb'

export const AssetIconMap: { [key: string]: ({ className }: { className?: string }) => JSX.Element } = {
  Model: RxCube,
  Material: FaRegCircle,
  Texture: LuWaves,
  Image: PiMountains,
  Lighting: FiSun,
  'Particle system': BsStars,
  'Visual script': TbRoute
}
