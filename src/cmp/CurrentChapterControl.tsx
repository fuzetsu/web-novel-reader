import { classNames } from 'lib/util'
import { useEffect, useState } from 'preact/hooks'

interface Props {
  chapter: number
  loadCount: number
  maxChapter?: number | null
  onChange(chapter: number): void
}

export function CurrentChapterControl({ chapter, loadCount, maxChapter, onChange }: Props) {
  const nextChapter = chapter + loadCount
  const previousChapter = Math.max(1, chapter - loadCount)

  const [chapterInput, setChapterInput] = useState(String(chapter))
  const [inputError, setInputError] = useState(false)

  const disableNext = Boolean(maxChapter && nextChapter > maxChapter)

  const handleChange = (chapter: number) => {
    onChange(chapter)
    setChapterInput(String(chapter))
  }

  useEffect(() => {
    setChapterInput(String(chapter))
  }, [chapter])

  return (
    <div className="current-chapter-control">
      <button disabled={chapter <= 1} onClick={() => handleChange(previousChapter)}>
        {loadCount > 1 && previousChapter} &#8592;
      </button>
      <input
        className={classNames('current-chapter-control__input', inputError && 'error')}
        value={chapterInput}
        size={5}
        onChange={e => {
          if (!(e.target instanceof HTMLInputElement)) return
          setChapterInput(e.target.value)
          const userInput = Number(e.target.value)
          const error = isNaN(userInput) || userInput < 1
          setInputError(error)
          if (!error) handleChange(userInput)
        }}
      />
      <button disabled={disableNext} onClick={() => handleChange(nextChapter)}>
        &#8594; {loadCount > 1 && nextChapter}
      </button>
    </div>
  )
}
