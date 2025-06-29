import { ChooseNovelModal } from '@/cmp/ChooseNovelModal'
import { RecentNovels } from '@/cmp/RecentNovels'
import {
  usePreventDefault,
  repeat,
  scrollToTop,
  isMobileSafari,
} from '@/lib/util'
import { Chapter } from '../Chapter'
import { CurrentChapterControl } from '../CurrentChapterControl'
import { ScrollControl } from '../ScrollControl'
import { createNovelState, isErrorChapter } from './hooks'
import { Nav } from '@/cmp/Nav'
import { Icon } from '@/cmp/Icon'
import { batch, createSignal, Index, Show } from 'solid-js'
import { cycleTheme, getThemeIcon } from '@/lib/theme'

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
    retryChapter,
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
    setServer,
  } = createNovelState()

  const resumeNewestChapter = usePreventDefault(() =>
    setCurrentChapter(newestChapter()),
  )
  const clearResume = usePreventDefault(() => setNewestChapter(currentChapter))
  const saveCurrent = usePreventDefault(saveCurrentChapters)
  const [savingChapters, setSavingChapters] = createSignal(false)
  const saveNext10 = usePreventDefault(async () => {
    if (savingChapters()) return
    setSavingChapters(true)
    await saveNextChapters(10)
    setSavingChapters(false)
  })

  const hasFailedChapters = () => chapters().some(isErrorChapter)

  const retryAllFailedChapters = usePreventDefault(() => {
    chapters().forEach((chapter, index) => {
      if (chapter && isErrorChapter(chapter)) {
        const chapterNumber = currentChapter() + index
        retryChapter(chapterNumber)
      }
    })
  })

  const toggleThemeButton = () => (
    <button onClick={cycleTheme}>
      <Icon name={getThemeIcon()} />
    </button>
  )

  const chapterControls = () => (
    <div aria-hidden>
      <CurrentChapterControl
        loadCount={loadCount()}
        chapter={currentChapter()}
        onChange={(chapter, loadCount) => {
          setCurrentChapter(chapter)
          setLoadCount(loadCount)
        }}
        maxChapter={novelType() === 'text' ? maxChapter()?.value : null}
      />
    </div>
  )

  const [chooseNovelOpen, setChooseNovelOpen] = createSignal(false)
  const toggleChooseNovel = usePreventDefault(() =>
    setChooseNovelOpen(!chooseNovelOpen()),
  )

  const changeNovelModal = () => (
    <Show when={chooseNovelOpen()}>
      <ChooseNovelModal
        currentChapter={currentChapter()}
        initialState={
          novelType() === 'text'
            ? {
                type: 'text',
                novelId: novelId(),
                novelText: novelText(),
                filter: filter(),
              }
            : {
                type: 'server',
                novelId: novelId(),
                server: server(),
                filter: filter(),
                offlineChapters: offlineChapters(),
              }
        }
        onClose={() => setChooseNovelOpen(false)}
        onChange={nextState =>
          batch(() => {
            if (!nextState.novelId) return
            if (nextState.novelId !== novelId()) {
              setNovelId(nextState.novelId)
            }
            setNovelType(nextState.type)
            setFilter(nextState.filter)
            if (nextState.type === 'server') {
              setServer(nextState.server)
              setOfflineChapters(nextState.offlineChapters)
            } else {
              setNovelText(nextState.novelText)
            }
          })
        }
      />
    </Show>
  )

  return (
    <Show
      when={novelId()}
      fallback={
        <div class="app">
          <Nav title="Recent novels">
            <button onClick={toggleChooseNovel}>
              Novel <Icon name="plusCircle" />
            </button>
            {toggleThemeButton()}
          </Nav>
          <RecentNovels recentNovels={recentNovels()} onRemove={removeRecent} />
          {changeNovelModal()}
        </div>
      }
    >
      {novelId => (
        <>
          {changeNovelModal()}
          <main class="app">
            <Nav title={novelName() || novelId()}>
              <a href="#/" class="button">
                <Icon name="home" />
              </a>
              <button onClick={toggleChooseNovel}>
                <Icon name="settings" />
              </button>
              {toggleThemeButton()}
            </Nav>
            {chapterControls()}
            <div aria-hidden class="button-group flex-center flex-wrap">
              <Show when={hasFailedChapters()}>
                <span class="notice-warning">
                  Failed to load some chapters.{' '}
                  <a href="" onClick={retryAllFailedChapters}>
                    Retry all failed chapters
                  </a>
                </span>
              </Show>
              <Show when={newestChapter() > currentChapter()}>
                <span class="notice">
                  <a href="" onClick={resumeNewestChapter}>
                    Resume chapter {newestChapter()}
                  </a>{' '}
                  or{' '}
                  <a href="" onClick={clearResume}>
                    reset to {currentChapter()}
                  </a>
                </span>
              </Show>
              <Show when={someCurrentChaptersUnsaved()}>
                <span class="notice">
                  <a href="" onClick={saveCurrent}>
                    Save chapter{loadCount() > 1 ? 's' : ''}
                  </a>
                  {' or '}
                  <a href="" onClick={saveNext10}>
                    next 10
                  </a>{' '}
                  for offline reading?
                </span>
              </Show>
              <Show when={maxChapter()?.value}>
                <span class="notice">
                  <Show
                    when={novelType() === 'server'}
                    fallback={<>{maxChapter()?.value} chapters</>}
                  >
                    <>
                      Latest chapter is {maxChapter()?.value},{' '}
                      <a onClick={usePreventDefault(checkMaxChapter)}>
                        check again
                      </a>
                    </>
                  </Show>
                </span>
              </Show>
            </div>
            <Index each={repeat(loadCount(), () => null)}>
              {(_, index) => {
                const chapter = () => currentChapter() + index
                const setChapter =
                  index > 0 ? () => setCurrentChapter(chapter()) : undefined
                return (
                  <Chapter
                    chapter={chapter()}
                    setChapter={setChapter}
                    lines={chapters()[index]}
                    onRetry={() => retryChapter(chapter())}
                  />
                )
              }}
            </Index>
            {chapterControls()}
            <div class="screenreader-only">
              End of content. Thanks for reading pal.
            </div>
            <div aria-hidden class="text-center">
              <button onClick={scrollToTop}>Scroll to the top</button>
            </div>
            <ScrollControl
              moreActions={[
                chapters().length > 0
                  ? {
                      label: 'Download epub',
                      onClick: async () => {
                        const bookData = {
                          title: `${novelName()} Chapter ${currentChapter()}-${currentChapter() + (loadCount() - 1)}`,
                          author: 'web-novel-reader',
                          language: 'en',
                          chapters: chapters().map((lines, index) => ({
                            title: `Chapter ${currentChapter() + index}`,
                            content: lines.join('\n\n'),
                          })),
                        }

                        const response = await fetch(
                          'https://json-to-epub.fuz.workers.dev/',
                          {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(bookData),
                          },
                        )
                        const url = URL.createObjectURL(await response.blob())
                        const a = document.createElement('a')
                        a.href = url
                        const extension = isMobileSafari() ? 'txt' : 'epub'
                        a.download = `${novelId()}-chapter-${currentChapter()}${loadCount() > 1 ? '-' + (currentChapter() + loadCount() - 1) : ''}.${extension}`
                        a.click()
                        URL.revokeObjectURL(url)
                      },
                    }
                  : null,
                chapters().length > 0
                  ? {
                      label: 'Copy',
                      onClick: async e => {
                        const content = chapters()
                          .map(
                            (lines, index) =>
                              `Chapter ${currentChapter() + index}:\n\n${lines.join('\n\n')}`,
                          )
                          .join('\n\n')
                        const btn = e.currentTarget
                        btn.textContent = 'Copying...'
                        await navigator.clipboard
                          .writeText(content)
                          .then(() => (btn.textContent = 'Copied!'))
                          .catch(err => {
                            console.error('Failed to copy chapters: ', err)
                            btn.textContent = 'Failed :('
                          })
                        setTimeout(() => (btn.textContent = 'Copy'), 1000)
                      },
                    }
                  : null,
                loadCount() > 1
                  ? {
                      label: `Load less (${loadCount()})`,
                      onClick: () => setLoadCount(loadCount() - 1),
                    }
                  : null,
              ]}
            />
          </main>
        </>
      )}
    </Show>
  )
}
