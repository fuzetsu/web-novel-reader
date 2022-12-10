import { getServerOverride, Server, SERVER_NAMES } from 'lib/api'
import { useState } from 'preact/hooks'
import { Modal } from './Modal'

interface Props {
  novelId: string | null
  server: Server
  filter: string
  onChange(server: Server, novelId: string | null, filter: string): void
  onClose(): void
}

export function ChooseNovelModal(props: Props) {
  const { onChange, onClose } = props
  const [server, setServer] = useState(props.server)
  const [novelId, setNovelId] = useState(props.novelId ?? '')
  const [filter, setFilter] = useState(props.filter)

  const cleanNovelId = novelId.toLowerCase().replace(/\s+/g, '-')

  const handleChange = () => {
    onChange(server, cleanNovelId, filter)
    onClose()
  }

  const override = getServerOverride(cleanNovelId)

  return (
    <Modal open onClose={onClose}>
      <div
        onKeyDown={e => {
          if (e.key === 'Enter' && (e.target as HTMLElement).nodeName !== 'TEXTAREA') handleChange()
        }}
      >
        <div className="form-group">
          <label>Novel ID</label>
          <input
            autoFocus
            value={novelId}
            onInput={e => setNovelId((e.target as HTMLInputElement | undefined)?.value ?? '')}
          />
        </div>
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
            onChange={e => setFilter((e.target as HTMLTextAreaElement).value)}
            placeholder="e.g. words to match|replacement"
          />
        </div>
        <button onClick={handleChange}>Save</button>
      </div>
    </Modal>
  )
}
