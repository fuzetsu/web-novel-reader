import { For, Show } from 'solid-js'
import { Icon } from './Icon'

interface Props {
  recentNovels: string[]
  onRemove(novelId: string): void
}

const idToTitle = (id: string) =>
  id.charAt(0).toUpperCase() +
  id.slice(1).replace(/-[a-z]/gi, x => ' ' + x.slice(1).toUpperCase())

const resumeNovel = (id: string, chapter?: string) =>
  (location.hash = `/${id}/${chapter ?? 1}`)

export function RecentNovels(props: Props) {
  const novels = () =>
    props.recentNovels.map(id => ({
      id,
      title: idToTitle(id),
      newestChapter: localStorage[`${id}-cur-chap`] as string | undefined,
    }))

  return (
    <div class="recent-novels">
      <For each={novels()}>
        {novel => (
          <div
            tabIndex={0}
            role="button"
            class="recent-novels__list-item"
            onClick={() => resumeNovel(novel.id, novel.newestChapter)}
            onKeyDown={e =>
              e.key === 'Enter' && resumeNovel(novel.id, novel.newestChapter)
            }
          >
            <div class="recent-novels__title">{novel.title}</div>
            <Show when={novel.newestChapter} fallback={<span />}>
              <div class="recent-novels__chapter">
                Chapter {novel.newestChapter}
              </div>
            </Show>
            <div
              role="button"
              tabIndex={0}
              class="recent-novels__remove"
              onClick={e => {
                e.stopPropagation()
                props.onRemove(novel.id)
              }}
            >
              <Icon invert name="trash" />
            </div>
          </div>
        )}
      </For>
    </div>
  )
}
