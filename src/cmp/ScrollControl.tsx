import { isDarkTheme } from '@/lib/theme'
import { useThrottledScroll } from '../lib/hooks'
import { classNames, notEmpty, throttledFn } from '../lib/util'
import { Icon } from './Icon'
import { createSignal, For, JSX, Show } from 'solid-js'
import { getCurrentChapter, scrollToNextChapter } from '@/lib/chapter'

type Action = { label: JSX.Element } & (
  | { url: string }
  | { onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> }
)

const defaultActions: Action[] = [{ label: 'Home', url: '/' }]

interface Props {
  moreActions?: (Action | null)[]
}

export function ScrollControl(props: Props) {
  const [scrollingDown, setScrollingDown] = createSignal(true)
  const [scrollPercentage, setScrollPercentage] = createSignal('0')

  const [currentChapter, setCurrentChapter] = createSignal(getCurrentChapter())

  const [showExtra, setShowExtra] = createSignal(false)

  const updateCurrentChapter = throttledFn(500, () =>
    setCurrentChapter(x => getCurrentChapter() ?? x),
  )

  let lastScroll: number
  useThrottledScroll(100, () => {
    const scrollElem = document.scrollingElement
    if (scrollElem) {
      const { scrollHeight, scrollTop } = scrollElem
      const curScroll = scrollTop + window.innerHeight
      setScrollPercentage(((curScroll / scrollHeight) * 100).toFixed(0))
      setScrollingDown(
        (curScroll > lastScroll && curScroll < scrollHeight) || scrollTop === 0,
      )
      lastScroll = curScroll
    }
    updateCurrentChapter()
  })

  const actions = () => [
    ...(props.moreActions ?? []).filter(notEmpty),
    ...defaultActions,
  ]

  return (
    <div
      aria-hidden
      class={classNames(
        'scroll-control',
        showExtra() && 'scroll-control--extra-visible',
      )}
    >
      <div
        class={classNames(
          'scroll-control__extra',
          showExtra() && 'scroll-control__extra--visible',
        )}
      >
        <Show when={currentChapter()}>
          <span class="notice">On chapter {currentChapter()}</span>
        </Show>
        <For each={actions()}>
          {link => (
            <button
              class="scroll-control__button"
              onClick={e => {
                if ('url' in link) location.hash = link.url
                else link.onClick(e)
              }}
            >
              {link.label}
            </button>
          )}
        </For>
      </div>
      <button
        class={classNames(
          'scroll-control__show-extra',
          showExtra() && 'scroll-control__show-extra--upside-down',
        )}
        onClick={() => setShowExtra(x => !x)}
      >
        {'\u2303'}
      </button>
      <button
        class="scroll-control__button"
        onClick={() => scrollToNextChapter(scrollingDown() ? 'down' : 'up')}
      >
        <Icon
          invert={isDarkTheme()}
          name={scrollingDown() ? 'arrowDown' : 'arrowUp'}
        />{' '}
        {scrollPercentage()}
      </button>
    </div>
  )
}
