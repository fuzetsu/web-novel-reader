import { ChooseNovelModal } from 'cmp/ChooseNovelModal'
import { RecentNovels } from 'cmp/RecentNovels'
import { preventDefault, repeat, scrollToTop } from 'lib/util'
import { useState } from 'preact/hooks'
import { Chapter } from '../Chapter'
import { CurrentChapterControl } from '../CurrentChapterControl'
import { ScrollControl } from '../ScrollControl'
import { useNovelState } from './hooks'
import { Nav } from 'cmp/Nav'
import { Icon } from 'cmp/Icon'

export function App() {
  const {
    chapters,
    checkMaxChapter,
    currentChapter,
    filter,
    loadCount,
    maxChapter,
    newestChapter,
    novelId,
    novelName,
    novelText,
    novelType,
    recentNovels,
    removeRecent,
    server,
    someCurrentChaptersUnsaved,
    offlineChapters,
    setOfflineChapters,
    saveCurrentChapters,
    saveNextChapters,
    setCurrentChapter,
    setFilter,
    setLoadCount,
    setNewestChapter,
    setNovelId,
    setNovelText,
    setNovelType,
    setServer
  } = useNovelState()

  const resumeNewestChapter = preventDefault(() => setCurrentChapter(newestChapter))
  const clearResume = preventDefault(() => setNewestChapter(currentChapter))
  const saveCurrent = preventDefault(saveCurrentChapters)
  const [savingChapters, setSavingChapters] = useState(false)
  const saveNext10 = preventDefault(async () => {
    setSavingChapters(true)
    await saveNextChapters(10)
    setSavingChapters(false)
  })

  const chapterControls = (
    <div aria-hidden>
      <CurrentChapterControl
        loadCount={loadCount}
        chapter={currentChapter}
        onChange={(chapter, loadCount) => {
          setCurrentChapter(chapter)
          setLoadCount(loadCount)
        }}
        maxChapter={novelType === 'text' ? maxChapter?.value : null}
      />
    </div>
  )

  const [chooseNovelOpen, setChooseNovelOpen] = useState(false)
  const toggleChooseNovel = preventDefault(() => setChooseNovelOpen(!chooseNovelOpen))

  const changeNovelModal = chooseNovelOpen && (
    <ChooseNovelModal
      currentChapter={currentChapter}
      state={
        novelType === 'text'
          ? { type: 'text', novelId, novelText, filter }
          : { type: 'server', novelId, server, filter, offlineChapters }
      }
      onClose={() => setChooseNovelOpen(false)}
      onChange={async nextState => {
        if (!nextState.novelId) return
        if (nextState.novelId !== novelId) {
          setNovelId(nextState.novelId)
          // hack: wait a frame after setting new novel ID to store subsequent state in correct localStorage key
          await new Promise(requestAnimationFrame)
        }
        setNovelType(nextState.type)
        setFilter(nextState.filter)
        if (nextState.type === 'server') {
          setServer(nextState.server)
          setOfflineChapters(nextState.offlineChapters)
        } else {
          setNovelText(nextState.novelText)
        }
      }}
    />
  )

  if (!novelId) {
    return (
      <div className="app">
        <Nav title="Recent novels">
          <button onClick={toggleChooseNovel}>
            Novel <Icon name="plusCircle" />
          </button>
        </Nav>
        <RecentNovels recentNovels={recentNovels} onRemove={removeRecent} />
        {changeNovelModal}
      </div>
    )
  }

  return (
    <>
      {changeNovelModal}
      <main className="app">
        <Nav title={novelName || novelId}>
          <a href="#/" className="button">
            <Icon name="home" />
          </a>
          <button onClick={toggleChooseNovel}>
            <Icon name="settings" />
          </button>
        </Nav>
        {chapterControls}
        <div aria-hidden className="button-group flex-center flex-wrap">
          {newestChapter > currentChapter && (
            <span className="notice">
              <a href="" onClick={resumeNewestChapter}>
                Resume chapter {newestChapter}
              </a>{' '}
              or{' '}
              <a href="" onClick={clearResume}>
                reset to {currentChapter}
              </a>
            </span>
          )}
          {someCurrentChaptersUnsaved && (
            <span className="notice">
              <a href="" onClick={saveCurrent}>
                Save chapter{loadCount > 1 ? 's' : ''}
              </a>
              {' or '}
              <a href="" onClick={saveNext10} disabled={savingChapters}>
                next 10
              </a>{' '}
              for offline reading?
            </span>
          )}
          {maxChapter && maxChapter.value && (
            <span className="notice">
              {novelType === 'server' ? (
                <>
                  Latest chapter is {maxChapter.value},{' '}
                  <a onClick={preventDefault(checkMaxChapter)}>check again</a>
                </>
              ) : (
                <>{maxChapter.value} chapters</>
              )}
            </span>
          )}
        </div>
        {repeat(loadCount, index => {
          const chapter = currentChapter + index
          const setChapter = index > 0 ? () => setCurrentChapter(chapter) : undefined
          const chapterLines = chapters[index]
          if (novelType === 'text' && !chapterLines) return null
          return (
            <Chapter key={chapter} chapter={chapter} setChapter={setChapter} lines={chapterLines} />
          )
        })}
        {chapterControls}
        <div className="screenreader-only">End of content. Thanks for reading pal.</div>
        <div aria-hidden className="text-center">
          <button onClick={scrollToTop}>Scroll to the top</button>
        </div>
        <ScrollControl
          moreActions={[
            loadCount > 1
              ? { label: `Load less (${loadCount})`, onClick: () => setLoadCount(loadCount - 1) }
              : null,
            chapters.length > 0
              ? {
                  label: 'Copy',
                  onClick: async e => {
                    const content = chapters
                      .map(
                        (chapter, index) =>
                          `Chapter ${currentChapter + index}:\n\n` + chapter.join('\n\n')
                      )
                      .join('\n\n')
                    const btn = e.target as HTMLButtonElement
                    btn.textContent = 'Copying...'
                    await navigator.clipboard
                      .writeText(content)
                      .then(() => (btn.textContent = 'Copied!'))
                      .catch(err => {
                        console.error('Failed to copy chapters: ', err)
                        btn.textContent = 'Failed :('
                      })
                    setTimeout(() => (btn.textContent = 'Copy'), 1000)
                  }
                }
              : null
          ]}
        />
      </main>
    </>
  )
}
