import { createSignal, createEffect, onCleanup, untrack } from 'solid-js'
import { usePersistedState } from './hooks'
import { IconName } from '@/cmp/Icon'

type ThemeSetting = 'light' | 'dark' | 'auto'

const [themeSetting, setThemeSetting] = usePersistedState<ThemeSetting>(
  () => 'app-theme',
  'auto',
)

const initialThemeSetting = themeSetting()
const [activeTheme, setActiveTheme] = createSignal<
  Exclude<ThemeSetting, 'auto'>
>(initialThemeSetting === 'auto' ? 'dark' : initialThemeSetting)

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
    if (cur === 'auto')
      return untrack(activeTheme) === 'light' ? 'dark' : 'light'
    if (cur === 'dark') return 'light'
    return 'auto'
  })
}
