interface Props {
  chapter: number
  loadCount: number
  setChapter(): void
  lines?: string[]
}

export function Chapter({ chapter, loadCount, lines, setChapter }: Props) {
  if (!lines) return <h3>Loading chapter {chapter}</h3>

  return (
    <div className="chapter" data-chapter={chapter}>
      <p data-pos={`${chapter}-0`}>
        <span className="huge">Chapter {chapter} </span>
        {loadCount > 1 && (
          <a
            aria-hidden
            className="small no-wrap"
            href=""
            onClick={e => {
              e.preventDefault()
              setChapter()
            }}
          >
            Set chapter
          </a>
        )}
      </p>
      {lines.map((line, index) => (
        <p key={index} data-pos={`${chapter}-${index + 1}`}>
          {line}
        </p>
      ))}
    </div>
  )
}
