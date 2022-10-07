import { preventDefault, repeat, scrollToTop } from 'lib/util'
import { Chapter } from '../Chapter'
import { CurrentChapterControl } from '../CurrentChapterControl'
import { LoadCountControl } from '../LoadCountControl'
import { ScrollControl } from '../ScrollControl'
import { useNovelState } from './hooks'

export function App() {
  const {
    novelId,
    novelName,
    promptNovel,
    currentChapter,
    setCurrentChapter,
    newestChapter,
    setNewestChapter,
    loadCount,
    setLoadCount,
    chapters
  } = useNovelState()

  const changeNovel = preventDefault(promptNovel)
  const resumeNewestChapter = preventDefault(() => setCurrentChapter(newestChapter))
  const clearResume = preventDefault(() => setNewestChapter(currentChapter))

  const chapterControls = (
    <p aria-hidden className="center">
      <CurrentChapterControl
        loadCount={loadCount}
        chapter={currentChapter}
        onChange={setCurrentChapter}
      />
    </p>
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
      {newestChapter > currentChapter && (
        <p aria-hidden className="center">
          <a href="" onClick={resumeNewestChapter}>
            Resume {newestChapter}
          </a>{' '}
          <a href="" onClick={clearResume}>
            (reset)
          </a>
        </p>
      )}
      {repeat(loadCount, index => {
        const chapter = currentChapter + index
        const setChapter = index > 0 ? () => setCurrentChapter(chapter) : undefined
        return (
          <Chapter
            key={chapter}
            chapter={chapter}
            setChapter={setChapter}
            lines={chapters[index]}
          />
        )
      })}
      {chapterControls}
      <div className="screenreader-only">End of content. Thanks for reading pal.</div>
      <div aria-hidden className="center">
        <button onClick={scrollToTop}>Scroll to the top</button>
      </div>
      <ScrollControl />
    </main>
  )
}
