import { fetchChapter } from '../lib/api'
import { promiseWithCancel, q } from '../lib/util'
import { useEffect, useState } from 'preact/hooks'

interface Props {
  chapter: number
  lastPos: string | null
  onResumedPos(): void
}

const COMMENTS_URL = 'https://www.wuxiaworld.com/novel/overgeared/og-chapter-'

const chapterCache = new Map<number, string[]>()

export function Chapter({ chapter, lastPos, onResumedPos }: Props) {
  const [lines, setLines] = useState(() => chapterCache.get(chapter))

  useEffect(() => {
    const lines = chapterCache.get(chapter)
    setLines(lines)
    if (lines) return
    let cancel: () => void | undefined
    const id = setTimeout(() => {
      cancel = promiseWithCancel(fetchChapter(chapter), lines => {
        setLines(lines)
        chapterCache.set(chapter, lines)
      })
    }, 500)
    return () => {
      cancel?.()
      clearTimeout(id)
    }
  }, [chapter, lines])

  useEffect(() => {
    if (lines && lastPos?.startsWith(chapter.toString()) && !lastPos.endsWith('-0')) {
      q(`[data-pos="${lastPos}"]`)?.scrollIntoView()
      onResumedPos()
    }
  }, [lines, lastPos])

  if (!lines) return <h3>Loading chapter {chapter}</h3>

  return (
    <div>
      <h1>Chapter {chapter}</h1>
      {lines.map((line, index) => (
        <p key={index} data-pos={`${chapter}-${index}`}>
          {line}
        </p>
      ))}
      <p aria-hidden>
        <a target="_blank" rel="noreferrer" href={COMMENTS_URL + chapter}>
          Wuxiaworld comments for chapter {chapter}
        </a>
      </p>
    </div>
  )
}
