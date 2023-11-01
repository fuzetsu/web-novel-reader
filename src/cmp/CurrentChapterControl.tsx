import { classNames } from 'lib/util'
import { useEffect, useState } from 'preact/hooks'

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

  useEffect(() => {
    setChapterInput(String(chapter))
  }, [chapter])

  return (
    <div className="current-chapter-control">
      <button disabled={chapter <= 1} onClick={() => handleChange(previousChapter)}>
        {loadCount > 1 && previousChapter} &#8592;
      </button>
      <button disabled={loadCount <= 1} onClick={() => onChange(chapter, loadCount - 1)}>
        -
      </button>
      <input
        className={classNames('current-chapter-control__input', inputError && 'error')}
        value={
          focused || loadCount === 1 ? chapterInput : `${chapter}-${chapter + (loadCount - 1)}`
        }
        size={5}
        onFocus={() => setFocused(true)}
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
      <button disabled={loadCount >= 20} onClick={() => onChange(chapter, loadCount + 1)}>
        +
      </button>
      <button disabled={disableNext} onClick={() => handleChange(nextChapter)}>
        &#8594; {loadCount > 1 && nextChapter}
      </button>
    </div>
  )
}
