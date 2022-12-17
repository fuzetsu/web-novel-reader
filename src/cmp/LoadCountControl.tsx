interface Props {
  loadCount: number
  onChange(loadCount: number): void
}

const MAX_LOAD_COUNT = 20

export function LoadCountControl({ loadCount, onChange }: Props) {
  return (
    <div className="load-count-control">
      <span className="load-count-control__left" style={{ textAlign: 'right' }}>
        Load
      </span>
      <span>
        <button onClick={() => onChange(Math.max(1, loadCount - 1))}>-</button> {loadCount}{' '}
        <button onClick={() => onChange(Math.min(loadCount + 1, MAX_LOAD_COUNT))}>+</button>
      </span>
      <span className="load-count-control__right" style={{ textAlign: 'left' }}>
        {loadCount === 1 ? 'chapter' : 'chapters'}
      </span>
    </div>
  )
}
