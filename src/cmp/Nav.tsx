import { ParentProps } from 'solid-js'

interface Props extends ParentProps {
  title: string
}

export function Nav(props: Props) {
  return (
    <nav aria-hidden class="nav">
      <span class="nav__title">{props.title}</span>
      <div class="nav__actions">{props.children}</div>
    </nav>
  )
}
