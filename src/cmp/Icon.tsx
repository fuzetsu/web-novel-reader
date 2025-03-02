import arrowDown from '@/assets/arrow-down.svg'
import arrowLeft from '@/assets/arrow-left.svg'
import arrowRight from '@/assets/arrow-right.svg'
import arrowUp from '@/assets/arrow-up.svg'
import clipboard from '@/assets/clipboard.svg'
import home from '@/assets/home.svg'
import plusCircle from '@/assets/plus-circle.svg'
import settings from '@/assets/settings.svg'
import trash from '@/assets/trash.svg'
import moon from '@/assets/moon.svg'
import sun from '@/assets/sun.svg'
import { JSX } from 'solid-js/jsx-runtime'

const icons = {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  clipboard,
  home,
  plusCircle,
  settings,
  trash,
  moon,
  sun,
} as const
type Icon = keyof typeof icons

interface Props {
  name: Icon
  invert?: boolean
  style?: JSX.CSSProperties
}

export function Icon(props: Props) {
  const invertStyle = () =>
    props.invert ? { filter: 'invert(100%)' } : undefined
  const mergedStyle = () => ({ ...invertStyle(), ...props.style })

  return <img class="icon" src={icons[props.name]} style={mergedStyle()} />
}
