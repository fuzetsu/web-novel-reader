import { useThrottledScroll } from 'lib/hooks'
import { qq, repeat, scrollToTop } from 'lib/util'
import { useEffect, useState } from 'preact/hooks'
import { Chapter } from './Chapter'
import { CurrentChapterControl } from './CurrentChapterControl'
import { LoadCountControl } from './LoadCountControl'
import { ScrollControl } from './ScrollControl'

const INITIAL_CHAPTER = Number(localStorage.getItem('last-chap') || 1)
const INITIAL_LOAD_COUNT = Number(localStorage.getItem('last-load-count') || 1)
const INITIAL_LAST_POS = localStorage.getItem('last-pos')

export function App() {
  const [currentChapter, setCurrentChapter] = useState(INITIAL_CHAPTER)
  const [loadCount, setLoadCount] = useState(INITIAL_LOAD_COUNT)
  const [lastPos, setLastPos] = useState<string | null>(INITIAL_LAST_POS)

  useEffect(() => {
    scrollToTop()
    localStorage.setItem('last-chap', String(currentChapter))
    localStorage.setItem('last-load-count', String(loadCount))
  }, [currentChapter, loadCount])

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
        return (
          <div key={chapter} data-chapter={chapter}>
            <Chapter chapter={chapter} lastPos={lastPos} onResumedPos={() => setLastPos(null)} />
          </div>
        )
      })}
      {chapterControls}
      <div className="center">
        <button onClick={scrollToTop}>Scroll to the top</button>
      </div>
      <ScrollControl />
    </main>
  )
}
