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
        {newestChapter > currentChapter && (
          <p>
            <a href="" onClick={resumeNewestChapter}>
              Resume {newestChapter}
            </a>{' '}
            <a href="" onClick={clearResume}>
              (reset)
            </a>
          </p>
        )}
      </div>
      {chapterControls}
      {repeat(loadCount, index => {
        const chapter = currentChapter + index
        return (
          <Chapter
            key={chapter}
            chapter={chapter}
            setChapter={() => setCurrentChapter(chapter)}
            lines={chapters[index]}
          />
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
