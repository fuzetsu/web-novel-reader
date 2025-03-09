import { qq, scrollToBottom, scrollToTop } from './util'

export const getCurrentChapter = () => {
  const chapters = qq<HTMLDivElement>('[data-chapter]')
  const currentChapter = chapters.find(chapter => {
    const chapterTop = chapter.offsetTop
    const chapterBottom = chapterTop + chapter.offsetHeight
    return window.scrollY >= chapterTop && window.scrollY < chapterBottom
  })
  return currentChapter?.dataset.chapter
}

export const scrollToNextChapter = (dir: 'up' | 'down') => {
  const chapters = qq('[data-chapter]')
  if (dir === 'down') {
    const nextChapter = chapters.find(
      chapter => chapter.getBoundingClientRect().top - window.innerHeight > -10,
    )
    if (nextChapter) nextChapter.scrollIntoView()
    else scrollToBottom()
  } else {
    const nextIndex = chapters
      .reverse()
      .findIndex(chapter => chapter.getBoundingClientRect().top < -10)
    const nextChapter = chapters.at(nextIndex)
    if (!nextChapter || nextIndex + 1 - chapters.length === 0) scrollToTop()
    else nextChapter.scrollIntoView()
  }
}

export function splitNovelText(novelText: string): string[][] {
  const allLines = novelText.split('\n')
  let chapterLines: string[] = []
  const chapters = [chapterLines]
  for (const line of allLines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue
    if (/^chapter [0-9]+/i.test(trimmedLine)) {
      chapterLines = []
      chapters.push(chapterLines)
    }
    chapterLines.push(trimmedLine)
  }
  return chapters.filter(lines => lines.length > 0)
}
