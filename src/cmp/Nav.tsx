import { getCurrentChapter } from '@/lib/chapter'
import { useScroll, useThrottledScroll } from '@/lib/hooks'
import { createEffect, createSignal, onCleanup, ParentProps } from 'solid-js'

interface Props extends ParentProps {
  title: string
}

export function Nav(props: Props) {
  const shouldFloat = () => window.scrollY > 100

  const [floating, setFloating] = createSignal(false)
  const [visible, setVisible] = createSignal(false)

  const [scrolledChapter, setScrolledChapter] =
    createSignal(getCurrentChapter())

  useScroll(() => {
    setFloating(shouldFloat())
    if (!floating()) setVisible(false)
  })
  useThrottledScroll(500, () => {
    if (visible() && floating())
      setScrolledChapter(x => getCurrentChapter() ?? x)
  })

  createEffect(() => {
    let lastClick = 0
    const handler = (e: MouseEvent) => {
      if (!shouldFloat()) return
      if ((e.target as Element).closest('button')) return
      const now = Date.now()
      if (now - lastClick < 400) {
        e.preventDefault()
        setVisible(x => !x)
      }
      lastClick = now
    }
    window.addEventListener('click', handler)
    onCleanup(() => window.removeEventListener('click', handler))
  })

  return (
    <nav
      aria-hidden
      class="nav"
      classList={{
        'nav--floating': floating(),
        'nav--floating-visible': floating() && visible(),
      }}
    >
      <span class="nav__title">
        {props.title}{' '}
        {visible() && floating() && scrolledChapter() && (
          <span class="nav__subtitle">Chapter {scrolledChapter()}</span>
        )}
      </span>
      <div class="nav__actions">{props.children}</div>
    </nav>
  )
}
