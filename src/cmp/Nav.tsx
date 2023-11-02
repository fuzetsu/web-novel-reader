import { ComponentChildren } from 'preact'

interface Props {
  title: string
  children: ComponentChildren
}

export function Nav({ title, children }: Props) {
  return (
    <nav aria-hidden className="nav">
      <span className="nav__title">{title}</span>
      <div className="nav__actions">{children}</div>
    </nav>
  )
}
