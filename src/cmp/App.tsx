import { fetchChapter } from 'lib/api'
import { useLocationHash, usePersistedState, useThrottledScroll } from 'lib/hooks'
import { delayWithCancel, promiseWithCancel, q, qq, repeat, scrollToTop } from 'lib/util'
import { useEffect, useMemo, useState } from 'preact/hooks'
import { Chapter } from './Chapter'
import { CurrentChapterControl } from './CurrentChapterControl'
import { LoadCountControl } from './LoadCountControl'
import { ScrollControl } from './ScrollControl'

export function App() {
  const hash = useLocationHash()
  const novelId = useMemo(() => location.hash.slice(2), [hash])
  const novelKey = (key: string) => `${novelId}-${key}`

  const [currentChapter, setCurrentChapter] = usePersistedState(novelKey('cur-chap'), 1)
  const [loadCount, setLoadCount] = usePersistedState(novelKey('load-count'), 1)

  const [chapters, setChapters] = useState<string[][]>([])
  useEffect(() => {
    scrollToTop()
    setChapters([])
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
  const [lastPos, setLastPos] = usePersistedState<string | null>(novelKey('last-pos'), null)
  useEffect(() => {
    if (!lastPos || !chapters.length || lastPos === `${currentChapter}-0`) return
    q(`[data-pos="${lastPos}"]`)?.scrollIntoView()
    setLastPos(null)
  }, [lastPos, chapters])

  useThrottledScroll(800, () => {
    const pos = qq<HTMLElement>('[data-pos]').find(pos => pos.getBoundingClientRect().bottom > 0)
      ?.dataset.pos
    console.log('saving pos!', pos)
    if (pos) localStorage.setItem(novelKey('last-pos'), JSON.stringify(pos))
  })

  const changeNovel = (evt: Event) => {
    evt.preventDefault()
    location.hash = '/' + (prompt('Edit novelfull ID', novelId || '') || '').toLowerCase()
  }

  const novelName = useMemo(
    () =>
      novelId
        ?.split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
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
      <h1 className="center">
        <button onClick={changeNovel}>Choose novel</button>
      </h1>
    )
  }

  return (
    <main className="app">
      <div aria-hidden className="center">
        <h1>
          <a href="" onClick={changeNovel}>
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
