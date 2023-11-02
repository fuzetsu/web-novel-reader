import { useMemo } from 'preact/hooks'

interface Props {
  recentNovels: string[]
  onRemove(novelId: string): void
}

const idToTitle = (id: string) =>
  id.charAt(0).toUpperCase() + id.slice(1).replace(/-[a-z]/gi, x => ' ' + x.slice(1).toUpperCase())

const resumeNovel = (id: string, chapter?: string) => (location.hash = `/${id}/${chapter ?? 1}`)

export function RecentNovels({ recentNovels, onRemove }: Props) {
  const novels = useMemo(
    () =>
      recentNovels.map(id => ({
        id,
        title: idToTitle(id),
        newestChapter: localStorage[`${id}-cur-chap`] as string | undefined
      })),
    [recentNovels]
  )

  return (
    <div className="recent-novels">
      {novels.map(({ id, title, newestChapter }) => (
        <div
          key={id}
          className="recent-novels__list-item"
          onClick={() => resumeNovel(id, newestChapter)}
          onKeyDown={e => e.key === 'Enter' && resumeNovel(id, newestChapter)}
        >
          <div className="recent-novels__title">{title}</div>
          {newestChapter ? (
            <div className="recent-novels__chapter">Chapter {newestChapter}</div>
          ) : (
            <span />
          )}
          <div
            role="button"
            tabIndex={0}
            className="recent-novels__remove"
            onClick={e => {
              e.stopPropagation()
              onRemove(id)
            }}
          >
            ❌
          </div>
        </div>
      ))}
    </div>
  )
}
