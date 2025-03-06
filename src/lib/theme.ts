import { createSignal, createEffect, onCleanup } from 'solid-js'
import { createPersistedState } from './hooks'
import { IconName } from '@/cmp/Icon'

const THEMES = ['auto', 'dark', 'light'] as const

type Theme = (typeof THEMES)[number]

const [themeSetting, setThemeSetting] = createPersistedState<Theme>(
  () => 'app-theme',
  'auto',
)

const initialThemeSetting = themeSetting()
const [activeTheme, setActiveTheme] = createSignal<Exclude<Theme, 'auto'>>(
  initialThemeSetting === 'auto' ? 'dark' : initialThemeSetting,
)

createEffect(() => {
  const setting = themeSetting()
  if (setting !== 'auto') {
    setActiveTheme(setting)
    return
  }
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  const update = (q: { matches: boolean }) =>
    setActiveTheme(q.matches ? 'dark' : 'light')
  update(query)
  query.addEventListener('change', update)
  onCleanup(() => query.removeEventListener('change', update))
})

createEffect(() => {
  const cls = activeTheme() + '-theme'
  document.documentElement.classList.add(cls)
  onCleanup(() => document.documentElement.classList.remove(cls))
})

export function getThemeIcon(): IconName {
  if (themeSetting() === 'light') return 'sun'
  if (themeSetting() === 'dark') return 'moon'
  return 'monitor'
}

export function isDarkTheme() {
  return activeTheme() === 'dark'
}

export function cycleTheme() {
  setThemeSetting(cur => {
    const curIndex = THEMES.indexOf(cur)
    const nextIndex = curIndex >= THEMES.length - 1 ? 0 : curIndex + 1
    return THEMES[nextIndex]
  })
}
