import { Server, SERVER_NAMES } from 'lib/api'
import { useState } from 'preact/hooks'
import { Modal } from './Modal'

interface Props {
  novelId: string | null
  server: Server
  onChange(novelId: string | null, server: Server): void
  onClose(): void
}

export function ChooseNovelModal(props: Props) {
  const { onChange, onClose } = props
  const [novelId, setNovelId] = useState(props.novelId ?? '')
  const [server, setServer] = useState(props.server)

  const cleanNovelId = novelId.toLowerCase().replace(/\s+/g, '-')

  const handleChange = () => {
    onChange(cleanNovelId, server)
    onClose()
  }

  return (
    <Modal open onClose={onClose}>
      <div
        onKeyDown={e => {
          if (e.key === 'Enter') handleChange()
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
          <label>Server</label>
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
        </div>
        <button onClick={handleChange}>Save</button>
      </div>
    </Modal>
  )
}
