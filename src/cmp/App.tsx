import { fetchChapter } from 'lib/api'
import { usePersistedState, useThrottledScroll } from 'lib/hooks'
import { delayWithCancel, promiseWithCancel, q, qq, repeat, scrollToTop } from 'lib/util'
import { useEffect, useMemo, useState } from 'preact/hooks'
import { Chapter } from './Chapter'
import { CurrentChapterControl } from './CurrentChapterControl'
import { LoadCountControl } from './LoadCountControl'
import { ScrollControl } from './ScrollControl'

export function App() {
  const [novelId, setNovelId] = usePersistedState<string | null>('novel-id', 'overgeared')
  const [chapters, setChapters] = useState<string[][]>([])
  const [currentChapter, setCurrentChapter] = usePersistedState('cur-chap', 1)
  const [loadCount, setLoadCount] = usePersistedState('load-count', 1)

  useEffect(() => {
    scrollToTop()
    setChapters([])
    console.log({ novelId })
    if (!novelId) return
    return delayWithCancel(500, () =>
      promiseWithCancel(
        Promise.all(
          repeat(loadCount, index =>
            fetchChapter(novelId, currentChapter + index).catch(() => ['Error fetching chapter.'])
          )
        ),
        setChapters
      )
    )
  }, [novelId, currentChapter, loadCount])

  // restore scroll position when chapters load
  const [lastPos, setLastPos] = usePersistedState<string | null>('last-pos', null)
  useEffect(() => {
    if (!lastPos || !chapters.length || lastPos === `${currentChapter}-0`) return
    q(`[data-pos="${lastPos}"]`)?.scrollIntoView()
    setLastPos(null)
  }, [lastPos, chapters])

  useThrottledScroll(800, () => {
    const pos = qq<HTMLElement>('[data-pos]').find(pos => pos.getBoundingClientRect().bottom > 0)
      ?.dataset.pos
    console.log('saving pos!', pos)
    if (pos) localStorage.setItem('last-pos', JSON.stringify(pos))
  })

  const changeNovel = () => setNovelId(prompt('Edit novelfull ID', novelId || ''))

  const novelName = useMemo(
    () =>
      novelId
        ?.split('-')
        .map(part => part[0].toUpperCase() + part.slice(1))
        .join(' '),
    [novelId]
  )

  const chapterControls = (
    <div aria-hidden className="center">
      <CurrentChapterControl
        loadCount={loadCount}
        chapter={currentChapter}
        onChange={setCurrentChapter}
      />
    </div>
  )

  if (!novelId) {
    return (
      <div className="center">
        <button onClick={changeNovel}>Choose novel</button>
      </div>
    )
  }

  return (
    <main className="app">
      <div aria-hidden className="center">
        <h1>
          <a href="#" onClick={changeNovel}>
            {novelName}
          </a>
        </h1>
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
