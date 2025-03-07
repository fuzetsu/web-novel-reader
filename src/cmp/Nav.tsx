import { getCurrentChapter } from '@/lib/chapter'
import { useScroll, useThrottledScroll } from '@/lib/hooks'
import { createEffect, createSignal, onCleanup, ParentProps } from 'solid-js'

interface Props extends ParentProps {
  title: string
}

export function Nav(props: Props) {
  const [sticky, setSticky] = createSignal(window.scrollY > 0)
  const [visible, setVisible] = createSignal(false)
  const [scrolledChapter, setScrolledChapter] = createSignal<number | null>(
    null,
  )
  useScroll(() => setSticky(window.scrollY > 0))
  useThrottledScroll(500, () => {
    if (!sticky() || !visible()) return
    const chap = Number(getCurrentChapter())
    if (!isNaN(chap)) setScrolledChapter(chap)
  })

  createEffect(() => {
    let lastClick = 0
    const handler = (e: MouseEvent) => {
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
      classList={{
        nav: true,
        'nav--sticky': sticky(),
        'nav--sticky-visible': sticky() && visible(),
      }}
    >
      <span class="nav__title">
        {props.title}{' '}
        {sticky() && scrolledChapter() && (
          <span class="nav__subtitle">Chapter {scrolledChapter()}</span>
        )}
      </span>
      <div class="nav__actions">{props.children}</div>
    </nav>
  )
}
