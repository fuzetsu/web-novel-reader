import { getServerOverride, Server, SERVER_NAMES } from '@/lib/api'
import { Modal } from './Modal'
import { TextField } from './TextField'
import { createMemo, createSignal, For, Match, Show, Switch } from 'solid-js'

interface CommonState {
  novelId: string | null
  filter: string
}

interface TextState extends CommonState {
  type: 'text'
  novelText: string
}

interface ServerState extends CommonState {
  type: 'server'
  server: Server
  offlineChapters: { [chapter: string]: string[] | undefined }
}

type State = TextState | ServerState

interface Props {
  currentChapter: number
  initialState: State
  onChange(nextState: State): void
  onClose(): void
}

export function ChooseNovelModal(props: Props) {
  const [novelType, setNovelType] = createSignal(props.initialState.type)
  const [novelId, setNovelId] = createSignal(
    props.initialState.novelId?.replace(/-/g, ' ') ?? '',
  )
  const [filter, setFilter] = createSignal(props.initialState.filter ?? '')
  const cleanNovelId = () => novelId().toLowerCase().replace(/\s+/g, '-')

  const commonFormDirty = () =>
    novelType() !== props.initialState.type ||
    cleanNovelId() !== props.initialState.novelId ||
    filter() !== props.initialState.filter

  const isNew = () => !props.initialState.novelId

  const serverState = () =>
    props.initialState.type === 'server' ? props.initialState : null
  const [server, setServer] = createSignal(
    serverState()?.server ?? 'novel-full',
  )
  const [offlineChapters, setOfflineChapters] = createSignal(
    serverState()?.offlineChapters ?? {},
  )
  const offlineData = createMemo(() => {
    const offlineChapterKeys = Object.keys(offlineChapters())
    const sizeKb = (
      (JSON.stringify(offlineChapters()).length * 2) /
      1024
    ).toFixed(2)
    return { offlineChapterKeys, sizeKb }
  })
  const serverFormDirty = () =>
    novelType() === 'server' &&
    (server() !== serverState()?.server ||
      offlineChapters() !== serverState()?.offlineChapters)

  const textState = () =>
    props.initialState.type === 'text' ? props.initialState : null
  const [novelText, setNovelText] = createSignal(textState()?.novelText ?? '')
  const textFormDirty = () =>
    novelType() === 'text' && novelText() !== textState()?.novelText

  const formDirty = () =>
    commonFormDirty() || serverFormDirty() || textFormDirty()

  const handleChange = () => {
    const common = { novelId: cleanNovelId(), filter: filter() }
    if (novelType() === 'server') {
      props.onChange({
        ...common,
        type: 'server',
        server: server(),
        offlineChapters: offlineChapters(),
      })
    } else if (novelType() === 'text') {
      props.onChange({ ...common, type: 'text', novelText: novelText() })
    }
    props.onClose()
  }

  const override = () => getServerOverride(cleanNovelId())

  const modalContent = (
    <div
      onKeyDown={e => {
        if (e.key === 'Enter' && e.target.nodeName !== 'TEXTAREA')
          handleChange()
      }}
    >
      <div class="form-group">
        <label>{novelType() === 'text' ? 'Novel name' : 'Novel ID'}</label>
        <TextField value={novelId()} disabled={!isNew()} onInput={setNovelId} />
      </div>
      <div class="form-group">
        <label>Type</label>
        <div class="button-group">
          <button
            class={novelType() === 'server' ? 'selected' : ''}
            onClick={() => setNovelType('server')}
          >
            Server
          </button>
          <button
            class={novelType() === 'text' ? 'selected' : ''}
            onClick={() => setNovelType('text')}
          >
            Text
          </button>
        </div>
      </div>
      <Switch>
        <Match when={novelType() === 'server'}>
          <div class="form-group">
            <label>Server {override() ? '(overridden)' : ''}</label>
            <Show when={!override()} fallback={<code>{override()}</code>}>
              <select
                value={server()}
                onChange={e => {
                  const select = e.currentTarget
                  setServer(
                    select.options[select.selectedIndex].value as Server,
                  )
                }}
              >
                <For each={SERVER_NAMES}>
                  {name => <option value={name}>{name}</option>}
                </For>
              </select>
            </Show>
          </div>
        </Match>
        <Match when={novelType() === 'text'}>
          <div class="form-group">
            <label>Content</label>
            <TextField
              showTextControls
              value={novelText()}
              rows={10}
              onInput={setNovelText}
              placeholder="Chapter 1: Once upon a time"
            />
          </div>
        </Match>
      </Switch>
      <div class="form-group">
        <label>Text filter</label>
        <TextField
          showTextControls
          value={filter()}
          rows={10}
          onInput={setFilter}
          placeholder="e.g. words to match|replacement"
        />
      </div>

      <Show when={offlineData().offlineChapterKeys.length > 0}>
        <div class="form-group">
          <label>Saved chapters (approx {offlineData().sizeKb}KB)</label>
          <div class="button-group">
            <Show
              when={
                props.currentChapter > 1 &&
                offlineData().offlineChapterKeys.some(
                  chapter => Number(chapter) < props.currentChapter,
                )
              }
            >
              <button
                onClick={() =>
                  setOfflineChapters(cache => {
                    const copy = { ...cache }
                    offlineData().offlineChapterKeys.forEach(chapter => {
                      if (Number(chapter) < props.currentChapter) {
                        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                        delete copy[chapter]
                      }
                    })
                    return copy
                  })
                }
              >
                Delete before {props.currentChapter}
              </button>
            </Show>
            <button onClick={() => setOfflineChapters({})}>
              Delete all ({offlineData().offlineChapterKeys.length})
            </button>
          </div>
        </div>
      </Show>
    </div>
  )

  const modalFooter = (
    <div class="button-group">
      <button disabled={!formDirty() || !novelId()} onClick={handleChange}>
        Save
      </button>
      <button onClick={() => props.onClose()}>Cancel</button>
    </div>
  )

  return (
    <Modal
      open
      onClose={props.onClose}
      content={modalContent}
      footer={modalFooter}
    />
  )
}
