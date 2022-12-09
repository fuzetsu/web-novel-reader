import { ChooseNovelModal } from 'cmp/ChooseNovelModal'
import { preventDefault, repeat, scrollToTop } from 'lib/util'
import { useState } from 'preact/hooks'
import { Chapter } from '../Chapter'
import { CurrentChapterControl } from '../CurrentChapterControl'
import { LoadCountControl } from '../LoadCountControl'
import { ScrollControl } from '../ScrollControl'
import { useNovelState } from './hooks'

export function App() {
  const {
    server,
    setServer,
    novelId,
    setNovelId,
    novelName,
    currentChapter,
    setCurrentChapter,
    newestChapter,
    setNewestChapter,
    loadCount,
    setLoadCount,
    chapters
  } = useNovelState()

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

  const [chooseNovelOpen, setChooseNovelOpen] = useState(false)
  const toggleChooseNovel = preventDefault(() => setChooseNovelOpen(!chooseNovelOpen))

  const changeNovelModal = chooseNovelOpen && (
    <ChooseNovelModal
      novelId={novelId}
      server={server}
      onClose={() => setChooseNovelOpen(false)}
      onChange={(novelId, server) => {
        if (novelId) {
          setNovelId(novelId)
          setServer(server)
        }
      }}
    />
  )

  if (!novelId) {
    return (
      <>
        {changeNovelModal}
        <h1 className="center">
          <button onClick={toggleChooseNovel}>Choose novel</button>
        </h1>
      </>
    )
  }

  return (
    <>
      {changeNovelModal}
      <main className="app">
        <div aria-hidden className="center">
          <h1>
            <a href="" onClick={toggleChooseNovel}>
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
    </>
  )
}
