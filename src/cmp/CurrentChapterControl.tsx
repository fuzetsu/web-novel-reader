import { useEffect, useState } from 'preact/hooks'

interface Props {
  chapter: number
  loadCount: number
  onChange(chapter: number): void
}

export function CurrentChapterControl({ chapter, loadCount, onChange }: Props) {
  const nextChapter = chapter + loadCount
  const previousChapter = Math.max(1, chapter - loadCount)

  const [chapterInput, setChapterInput] = useState(String(chapter))
  const [inputError, setInputError] = useState(false)

  const handleChange = (chapter: number) => {
    onChange(chapter)
    setChapterInput(String(chapter))
  }

  useEffect(() => {
    setChapterInput(String(chapter))
  }, [chapter])

  return (
    <div>
      {chapter > 1 && (
        <button onClick={() => handleChange(previousChapter)}>{previousChapter} &#8592;</button>
      )}
      <input
        className={inputError ? 'error' : ''}
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
      <button onClick={() => handleChange(nextChapter)}>&#8594; {nextChapter}</button>
    </div>
  )
}
