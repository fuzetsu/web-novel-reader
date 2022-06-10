import { fetchChapter } from 'lib/api'
import { useThrottledScroll } from 'lib/hooks'
import { delayWithCancel, promiseWithCancel, q, qq, repeat, scrollToTop } from 'lib/util'
import { useEffect, useState } from 'preact/hooks'
import { Chapter } from './Chapter'
import { CurrentChapterControl } from './CurrentChapterControl'
import { LoadCountControl } from './LoadCountControl'
import { ScrollControl } from './ScrollControl'

const INITIAL_CHAPTER = Number(localStorage.getItem('last-chap') || 1)
const INITIAL_LOAD_COUNT = Number(localStorage.getItem('last-load-count') || 1)
const INITIAL_LAST_POS = localStorage.getItem('last-pos')

export function App() {
  // load chapters and save config whenever vars change
  const [currentChapter, setCurrentChapter] = useState(INITIAL_CHAPTER)
  const [loadCount, setLoadCount] = useState(INITIAL_LOAD_COUNT)
  const [chapters, setChapters] = useState<string[][]>([])
  useEffect(() => {
    scrollToTop()
    setChapters([])
    localStorage.setItem('last-chap', String(currentChapter))
    localStorage.setItem('last-load-count', String(loadCount))
    return delayWithCancel(500, () =>
      promiseWithCancel(
        Promise.all(repeat(loadCount, index => fetchChapter(currentChapter + index))),
        setChapters
      )
    )
  }, [currentChapter, loadCount])

  // restore scroll position when chapters load
  const [lastPos, setLastPos] = useState<string | null>(INITIAL_LAST_POS)
  useEffect(() => {
    if (!lastPos || !chapters.length || lastPos === `${currentChapter}-0`) return
    q(`[data-pos="${lastPos}"]`)?.scrollIntoView()
    setLastPos(null)
  }, [lastPos, chapters])

  useThrottledScroll(800, () => {
    const pos = qq<HTMLElement>('[data-pos]').find(pos => pos.getBoundingClientRect().bottom > 0)
      ?.dataset.pos
    console.log('saving pos!', pos)
    if (pos) localStorage.setItem('last-pos', pos)
  })

  const chapterControls = (
    <div aria-hidden className="center">
      <CurrentChapterControl
        loadCount={loadCount}
        chapter={currentChapter}
        onChange={setCurrentChapter}
      />
    </div>
  )

  return (
    <main className="app">
      <div aria-hidden className="center">
        <LoadCountControl loadCount={loadCount} onChange={setLoadCount} />
      </div>
      {chapterControls}
      {repeat(loadCount, index => {
        const chapter = currentChapter + index
        return <Chapter key={chapter} chapter={chapter} lines={chapters[index]} />
      })}
      {chapterControls}
      <div className="center">
        <button onClick={scrollToTop}>Scroll to the top</button>
      </div>
      <ScrollControl />
    </main>
  )
}
