import { createSignal, createEffect, onCleanup } from 'solid-js'

export const [theme, setTheme] = createSignal<'light' | 'dark'>('dark')

createEffect(() => {
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  const update = (q: { matches: boolean }) =>
    setTheme(q.matches ? 'dark' : 'light')
  update(query)
  query.addEventListener('change', update)
  onCleanup(() => query.removeEventListener('change', update))
})

createEffect(() => {
  if (!theme()) return
  const cls = theme() + '-theme'
  document.documentElement.classList.add(cls)
  onCleanup(() => document.documentElement.classList.remove(cls))
})
