import { JSX } from 'preact/jsx-runtime'

interface Props {
  open: boolean
  onClose?(): void
  children: JSX.Element | JSX.Element[]
}

export function Modal({ open, onClose, children }: Props) {
  if (!open) return null

  return (
    <div
      className="modal-overlay"
      onClick={e =>
        (e.target as HTMLDivElement | undefined)?.className === 'modal-overlay' ? onClose?.() : null
      }
    >
      <div className="modal">{children}</div>
    </div>
  )
}
