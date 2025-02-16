import { classNames } from 'lib/util'
import { useState } from 'preact/hooks'
import { DISABLE_AUTO_INPUT_PROPS } from './TextField'
import { Icon } from './Icon'

interface Props {
  chapter: number
  loadCount: number
  maxChapter?: number | null
  onChange(chapter: number, loadCount: number): void
}

export function CurrentChapterControl({ chapter, loadCount, maxChapter, onChange }: Props) {
  const nextChapter = chapter + loadCount
  const previousChapter = Math.max(1, chapter - loadCount)

  const [chapterInput, setChapterInput] = useState(String(chapter))
  const [inputError, setInputError] = useState(false)
  const [focused, setFocused] = useState(false)

  const disableNext = Boolean(maxChapter && nextChapter > maxChapter)

  const handleChange = (newChapter: number) => {
    onChange(newChapter, loadCount)
    setChapterInput(String(newChapter))
  }

  return (
    <div className="current-chapter-control">
      <button disabled={chapter <= 1} onClick={() => handleChange(previousChapter)}>
        {loadCount > 1 && previousChapter} <Icon name="arrowLeft" />
      </button>
      <button disabled={loadCount <= 1} onClick={() => onChange(chapter, loadCount - 1)}>
        -
      </button>
      <input
        {...DISABLE_AUTO_INPUT_PROPS}
        className={classNames('current-chapter-control__input', inputError && 'error')}
        value={
          focused || loadCount === 1 ? chapterInput : `${chapter}-${chapter + (loadCount - 1)}`
        }
        onFocus={() => {
          setChapterInput(String(chapter))
          setFocused(true)
        }}
        onBlur={() => setFocused(false)}
        onChange={e => {
          if (!(e.target instanceof HTMLInputElement)) return
          setChapterInput(e.target.value)
          const userInput = Number(e.target.value)
          const error = isNaN(userInput) || userInput < 1
          setInputError(error)
          if (!error) handleChange(userInput)
        }}
      />
      <button
        disabled={disableNext || loadCount >= 20}
        onClick={() => onChange(chapter, loadCount + 1)}
      >
        +
      </button>
      <button disabled={disableNext} onClick={() => handleChange(nextChapter)}>
        <Icon name="arrowRight" /> {loadCount > 1 && nextChapter}
      </button>
    </div>
  )
}
