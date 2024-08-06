import { getServerOverride, Server, SERVER_NAMES } from 'lib/api'
import { useAutoFocusRef } from 'lib/hooks'
import { useMemo, useState } from 'preact/hooks'
import { Modal } from './Modal'
import { TextField } from './TextField'
import { RefObject } from 'preact'

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
  offlineChapters: { [chapter: string]: string[] }
}

type State = TextState | ServerState

interface Props {
  currentChapter: number
  state: State
  onChange(nextState: State): void
  onClose(): void
}

export function ChooseNovelModal(props: Props) {
  const { currentChapter, onClose, state, onChange } = props

  const [novelType, setNovelType] = useState(state.type)
  const [novelId, setNovelId] = useState(() => state.novelId?.replace(/-/g, ' ') ?? '')
  const [filter, setFilter] = useState(state.filter ?? '')
  const cleanNovelId = novelId.toLowerCase().replace(/\s+/g, '-')

  const isNew = !state.novelId

  const serverState = state.type === 'server' ? state : null
  const [server, setServer] = useState(serverState?.server ?? 'novel-full')
  const [offlineChapters, setOfflineChapters] = useState(serverState?.offlineChapters ?? {})
  const { offlineChapterKeys, sizeKb } = useMemo(() => {
    const offlineChapterKeys = Object.keys(offlineChapters)
    const sizeKb = ((JSON.stringify(offlineChapters).length * 2) / 1024).toFixed(2)
    return { offlineChapterKeys, sizeKb }
  }, [offlineChapters])
  const serverFormDirty =
    novelType === 'server' &&
    (server !== serverState?.server || offlineChapters !== serverState?.offlineChapters)

  const textState = state.type === 'text' ? state : null
  const [novelText, setNovelText] = useState(textState?.novelText ?? '')
  const textFormDirty = novelType === 'text' && novelText !== textState?.novelText

  const formDirty =
    serverFormDirty ||
    textFormDirty ||
    novelType !== state.type ||
    novelId !== state.novelId ||
    filter !== state.filter

  const handleChange = () => {
    if (novelType === 'server') {
      onChange({ type: 'server', filter, novelId: cleanNovelId, server, offlineChapters })
    } else if (novelType === 'text') {
      onChange({ type: 'text', novelId: cleanNovelId, novelText, filter })
    }
    onClose()
  }

  const override = getServerOverride(cleanNovelId)

  const [autoFocusRef] = useAutoFocusRef<HTMLInputElement>()

  const serverFormContent = novelType === 'server' && (
    <div className="form-group">
      <label>Server {override ? '(overridden)' : ''}</label>
      {override ? (
        <code>{override}</code>
      ) : (
        <select
          value={server}
          onChange={e => {
            const select = e.target as HTMLSelectElement
            setServer(select.options[select.selectedIndex].value as Server)
          }}
        >
          {SERVER_NAMES.map(name => (
            <option value={name}>{name}</option>
          ))}
        </select>
      )}
    </div>
  )

  const textFormContent = novelType === 'text' && (
    <div className="form-group">
      <label>Content</label>
      <TextField
        showTextControls
        value={novelText}
        rows={10}
        onInput={setNovelText}
        placeholder="Chapter 1: Once upon a time"
      />
    </div>
  )

  const modalContent = (
    <div
      onKeyDown={e => {
        if (e.key === 'Enter' && (e.target as HTMLElement).nodeName !== 'TEXTAREA') handleChange()
      }}
    >
      <div className="form-group">
        <label>{novelType === 'text' ? 'Novel name' : 'Novel ID'}</label>
        <TextField
          fieldRef={isNew ? autoFocusRef : undefined}
          value={novelId}
          disabled={!isNew}
          onInput={setNovelId}
        />
      </div>
      <div className="form-group">
        <label>Type</label>
        <div className="button-group">
          <button
            ref={isNew ? undefined : (autoFocusRef as RefObject<HTMLButtonElement>)}
            class={novelType === 'server' ? 'selected' : ''}
            onClick={() => setNovelType('server')}
          >
            Server
          </button>
          <button
            class={novelType === 'text' ? 'selected' : ''}
            onClick={() => setNovelType('text')}
          >
            Text
          </button>
        </div>
      </div>
      {serverFormContent}
      {textFormContent}
      <div className="form-group">
        <label>Text filter</label>
        <TextField
          showTextControls
          value={filter}
          rows={10}
          onInput={setFilter}
          placeholder="e.g. words to match|replacement"
        />
      </div>

      {offlineChapterKeys.length > 0 && (
        <div className="form-group">
          <label>Saved chapters (approx {sizeKb}KB)</label>
          <div className="button-group">
            {currentChapter > 1 &&
              offlineChapterKeys.some(chapter => Number(chapter) < currentChapter) && (
                <button
                  onClick={() =>
                    setOfflineChapters(cache => {
                      const copy = { ...cache }
                      offlineChapterKeys.forEach(chapter => {
                        if (Number(chapter) < currentChapter) delete copy[chapter]
                      })
                      return copy
                    })
                  }
                >
                  Delete before {currentChapter}
                </button>
              )}
            <button onClick={() => setOfflineChapters({})}>
              Delete all ({offlineChapterKeys.length})
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const modalFooter = (
    <div className="button-group">
      <button disabled={!formDirty || !novelId} onClick={handleChange}>
        Save
      </button>
      <button onClick={onClose}>Cancel</button>
    </div>
  )

  return <Modal open onClose={onClose} content={modalContent} footer={modalFooter} />
}
