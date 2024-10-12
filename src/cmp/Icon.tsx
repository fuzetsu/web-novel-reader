import arrowDown from 'assets/arrow-down.svg'
import arrowLeft from 'assets/arrow-left.svg'
import arrowRight from 'assets/arrow-right.svg'
import arrowUp from 'assets/arrow-up.svg'
import clipboard from 'assets/clipboard.svg'
import home from 'assets/home.svg'
import plusCircle from 'assets/plus-circle.svg'
import settings from 'assets/settings.svg'
import trash from 'assets/trash.svg'

const icons = {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  clipboard,
  home,
  plusCircle,
  settings,
  trash
} as const
type Icon = keyof typeof icons

interface Props {
  name: Icon
  invert?: boolean
}

export function Icon({ name, invert }: Props) {
  const style = invert ? { filter: 'invert(100%)' } : undefined

  return <img className="icon" src={icons[name]} style={style} />
}
