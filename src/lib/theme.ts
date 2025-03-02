import { createSignal, createEffect, onCleanup } from 'solid-js'

export const [theme, setTheme] = createSignal<'light' | 'dark'>('dark')

createEffect(() => {
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  setTheme(query.matches ? 'dark' : 'light')

  const handler = (e: MediaQueryListEvent) => {
    setTheme(e.matches ? 'dark' : 'light')
  }
  query.addEventListener('change', handler)
  onCleanup(() => query.removeEventListener('change', handler))
})

createEffect(() => {
  if (!theme()) return
  const cls = theme() + '-theme'
  document.documentElement.classList.add(cls)
  onCleanup(() => document.documentElement.classList.remove(cls))
})
