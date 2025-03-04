import { classNames } from '@/lib/util'
import { DISABLE_AUTO_INPUT_PROPS } from './TextField'
import { Icon } from './Icon'
import { createEffect, createSignal } from 'solid-js'

interface Props {
  chapter: number
  loadCount: number
  maxChapter?: number | null
  onChange(chapter: number, loadCount: number): void
}

export function CurrentChapterControl(props: Props) {
  const nextChapter = () => props.chapter + props.loadCount
  const previousChapter = () => Math.max(1, props.chapter - props.loadCount)

  const [chapterInput, setChapterInput] = createSignal('')
  const [focused, setFocused] = createSignal(false)

  // keep chapter input and error state in sync with external props.chapter changes
  createEffect(() => {
    setChapterInput(String(props.chapter))
  })

  const hasInputError = () => {
    const userInput = Number(chapterInput())
    return isNaN(userInput) || userInput < 1
  }

  const disableNext = () =>
    Boolean(props.maxChapter && nextChapter() > props.maxChapter)

  const handleChapterChange = (newChapter: number) =>
    props.onChange(newChapter, props.loadCount)

  return (
    <div class="current-chapter-control">
      <button
        disabled={props.chapter <= 1}
        onClick={() => handleChapterChange(previousChapter())}
      >
        {props.loadCount > 1 && previousChapter()} <Icon name="arrowLeft" />
      </button>
      <button
        disabled={props.loadCount <= 1}
        onClick={() => props.onChange(props.chapter, props.loadCount - 1)}
      >
        -
      </button>
      <input
        {...DISABLE_AUTO_INPUT_PROPS}
        inputMode="numeric"
        class={classNames(
          'current-chapter-control__input',
          hasInputError() && 'error',
        )}
        value={
          focused() || props.loadCount === 1
            ? chapterInput()
            : `${props.chapter}-${props.chapter + (props.loadCount - 1)}`
        }
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={e => {
          const value = e.currentTarget.value
          setChapterInput(value)
          if (!hasInputError()) handleChapterChange(Number(value))
        }}
      />
      <button
        disabled={disableNext() || props.loadCount >= 20}
        onClick={() => props.onChange(props.chapter, props.loadCount + 1)}
      >
        +
      </button>
      <button
        disabled={disableNext()}
        onClick={() => handleChapterChange(nextChapter())}
      >
        <Icon name="arrowRight" /> {props.loadCount > 1 && nextChapter()}
      </button>
    </div>
  )
}
