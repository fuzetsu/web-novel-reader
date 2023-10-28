import { getServerOverride, Server, SERVER_NAMES } from 'lib/api'
import { useAutoFocusRef } from 'lib/hooks'
import { useState } from 'preact/hooks'
import { Modal } from './Modal'

interface CommonState {
  novelId: string | null
}

interface TextState extends CommonState {
  type: 'text'
  novelText: string
}

interface ServerState extends CommonState {
  type: 'server'
  server: Server
  filter: string
}

type State = TextState | ServerState

interface Props {
  state: State
  onChange(nextState: State): void
  onClose(): void
}

const COMMON_INPUT_PROPS = {
  autoComplete: 'off',
  autoCapitalize: 'off',
  autoCorrect: 'off'
} as const

export function ChooseNovelModal(props: Props) {
  const { onClose, state, onChange } = props

  const [novelType, setNovelType] = useState(state.type)
  const [novelId, setNovelId] = useState(state.novelId ?? '')
  const cleanNovelId = novelId.toLowerCase().replace(/\s+/g, '-')

  const serverState = state.type === 'server' ? state : null
  const [filter, setFilter] = useState(serverState?.filter ?? '')
  const [server, setServer] = useState(serverState?.server ?? 'novel-full')
  const serverFormDirty =
    novelType === 'server' && (server !== serverState?.server || filter !== serverState.filter)

  const textState = state.type === 'text' ? state : null
  const [novelText, setNovelText] = useState(textState?.novelText ?? '')
  const textFormDirty = novelType === 'text' && novelText !== textState?.novelText

  const formDirty =
    serverFormDirty || textFormDirty || novelType !== state.type || novelId !== state.novelId

  const handleChange = () => {
    if (novelType === 'server') onChange({ type: 'server', filter, novelId, server })
    else if (novelType === 'text') onChange({ type: 'text', novelId, novelText: novelText })
    onClose()
  }

  const override = getServerOverride(cleanNovelId)

  const novelIdInputRef = useAutoFocusRef<HTMLInputElement>()

  const serverFormContent = novelType === 'server' && (
    <>
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
      <div className="form-group">
        <label>Text filter</label>
        <textarea
          value={filter}
          style={{ width: '100%' }}
          rows={10}
          onInput={e => setFilter((e.target as HTMLTextAreaElement).value)}
          placeholder="e.g. words to match|replacement"
        />
      </div>
    </>
  )

  const textFormContent = novelType === 'text' && (
    <div className="form-group">
      <label>Content</label>
      <textarea
        {...COMMON_INPUT_PROPS}
        value={novelText}
        style={{ width: '100%' }}
        rows={10}
        onInput={e => setNovelText((e.target as HTMLTextAreaElement).value)}
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
        <label>Novel ID</label>
        <input
          {...COMMON_INPUT_PROPS}
          ref={novelIdInputRef}
          value={novelId}
          onInput={e => setNovelId((e.target as HTMLInputElement | undefined)?.value ?? '')}
        />
      </div>
      <div className="form-group">
        <label>Type</label>
        <div className="button-group">
          <button disabled={novelType === 'server'} onClick={() => setNovelType('server')}>
            Server
          </button>
          <button disabled={novelType === 'text'} onClick={() => setNovelType('text')}>
            Text
          </button>
        </div>
      </div>
      {serverFormContent}
      {textFormContent}
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
