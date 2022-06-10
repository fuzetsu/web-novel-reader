interface Props {
  chapter: number
  lines?: string[]
}

const COMMENTS_URL = 'https://www.wuxiaworld.com/novel/overgeared/og-chapter-'

export function Chapter({ chapter, lines }: Props) {
  if (!lines) return <h3>Loading chapter {chapter}</h3>

  return (
    <div data-chapter={chapter}>
      <h1 data-pos={`${chapter}-0`}>Chapter {chapter}</h1>
      {lines.map((line, index) => (
        <p key={index} data-pos={`${chapter}-${index + 1}`}>
          {line}
        </p>
      ))}
      <p aria-hidden>
        <a target="_blank" rel="noreferrer" href={COMMENTS_URL + chapter}>
          Wuxiaworld comments for chapter {chapter}
        </a>
      </p>
    </div>
  )
}
