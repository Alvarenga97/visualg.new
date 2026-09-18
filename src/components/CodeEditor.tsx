import { useMemo, useRef } from 'react'
import { tokenizeHighlight } from '../portugol/highlight'

interface Props {
  value: string
  onChange: (value: string) => void
}

const NO_CLS = new Set(['id', 'ws', 'nl', 'op'])

export default function CodeEditor({ value, onChange }: Props) {
  const preRef = useRef<HTMLPreElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const segments = useMemo(() => tokenizeHighlight(value), [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value.replace(/\t/g, '    '))
  }

  const syncScroll = () => {
    const ta = taRef.current
    const pre = preRef.current
    if (!ta || !pre) return
    pre.style.transform = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop}px)`
  }

  return (
    <div className="relative h-full overflow-hidden bg-ink-900">
      <pre
        ref={preRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-0 min-w-full p-4 font-mono text-[13px] leading-6 whitespace-pre text-ink-100"
      >
        <code>
          {segments.map((s, i) => (
            <span key={i} className={NO_CLS.has(s.cls) ? undefined : `tok-${s.cls}`}>
              {s.text}
            </span>
          ))}
          {'\n'}
        </code>
      </pre>
      <textarea
        ref={taRef}
        value={value}
        onChange={handleChange}
        onScroll={syncScroll}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        placeholder="algoritmo ..."
        className="relative z-10 block h-full w-full resize-none overflow-auto bg-transparent p-4 font-mono text-[13px] leading-6 whitespace-pre text-transparent caret-ink-100 outline-none"
      />
    </div>
  )
}