import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor'
import { PortugolParser } from '../portugol/parser'
import { PortugolInterpreter } from '../portugol/interpreter'
import { exercicioPorId } from '../data/exercises'
import { registrarAtividade } from '../lib/atividades'

type Status = 'parado' | 'rodando' | 'aguardando' | 'ok' | 'falhou' | 'erro'

interface Linha {
  tipo: 'saida' | 'erro' | 'entrada' | 'sistema'
  texto: string
}

const SAMPLE = `algoritmo "exemplo"
var
  nome: caractere
inicio
  escreva("Qual é o seu nome? ")
  leia(nome)
  escreval("Olá, ", nome)
fim_algoritmo`

const STATUS_LABEL: Record<Status, string> = {
  parado: 'pronto',
  rodando: 'executando',
  aguardando: 'aguardando entrada',
  ok: 'concluído',
  falhou: 'falhou',
  erro: 'erro',
}

function normaliza(texto: string): string[] {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
}

export default function EditorPage() {
  const [params] = useSearchParams()
  const exercicioId = params.get('exercicio')

  const exercicio = exercicioId ? exercicioPorId(exercicioId) : undefined

  const [code, setCode] = useState(exercicio?.inicial ?? SAMPLE)
  const [linhas, setLinhas] = useState<Linha[]>([])
  const [status, setStatus] = useState<Status>('parado')
  const [input, setInput] = useState('')

  const pendingRead = useRef<{ resolve: (v: string) => void } | null>(null)
  const inputQueue = useRef<string[]>([])
  const computandoRef = useRef(false)
  const consoleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (exercicio) {
      setCode(exercicio.inicial)
      setLinhas([])
      setStatus('parado')
      inputQueue.current = []
      pendingRead.current = null
    }
  }, [exercicioId])

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [linhas])

  const append = useCallback((tipo: Linha['tipo'], texto: string) => {
    setLinhas((prev) => [...prev, { tipo, texto }])
  }, [])

  const resetCode = () => {
    setCode(exercicio?.inicial ?? SAMPLE)
    setLinhas([])
    setStatus('parado')
    pendingRead.current = null
    inputQueue.current = []
  }

  const limparSaida = () => {
    setLinhas([])
    setStatus('parado')
  }

  const executar = useCallback(
    async (autoInputs?: string[], esperado?: string): Promise<boolean | null> => {
      if (computandoRef.current) return null
      computandoRef.current = true
      setLinhas([])
      setStatus('rodando')

      const buffer: string[] = []
      const queue = [...(autoInputs ?? [])]

      const io = {
        write: (t: string) => {
          buffer.push(t)
          append('saida', t)
        },
        clear: () => {
          buffer.splice(0, buffer.length)
          setLinhas([])
        },
        read: () =>
          new Promise<string>((resolve) => {
            if (queue.length > 0) {
              const v = queue.shift() as string
              append('entrada', `> ${v}`)
              resolve(v)
              return
            }
            pendingRead.current = { resolve }
            setStatus('aguardando')
          }),
      }

      try {
        const program = new PortugolParser().parse(code)
        await new PortugolInterpreter().run(program, io)
        if (esperado !== undefined) {
          const obtido = normaliza(buffer.join('')).join(' ')
          const esperadoNorm = normaliza(esperado).join(' ')
          const passou = obtido === esperadoNorm
          append(
            'sistema',
            passou
              ? '✓ Teste passou! Saída igual à esperada.'
              : `✗ Teste falhou.\n  esperado: ${esperadoNorm}\n  obtido:    ${obtido || '(vazio)'}`,
          )
          setStatus(passou ? 'ok' : 'falhou')
          return passou
        }
        setStatus('ok')
        return null
      } catch (e) {
        const err = e as { message?: string; line?: number }
        const linha = typeof err?.line === 'number' ? ` [linha ${err.line}]` : ''
        append('erro', `${err?.message ?? String(e)}${linha}`)
        setStatus('erro')
        return null
      } finally {
        computandoRef.current = false
      }
    },
    [code, append],
  )

  const rodar = () => executar()

  const testar = async () => {
    if (!exercicio) return
    const auto = exercicio.entrada ? exercicio.entrada.split('\n') : []
    const passou = await executar(auto, exercicio.saida)
    if (passou) {
      await registrarAtividade(exercicio.id)
      append('sistema', `✓ Atividade registrada (+${exercicio.dificuldade * 10} pts).`)
    }
  }

  const enviarInput = () => {
    const v = input
    setInput('')
    append('entrada', `> ${v}`)
    pendingRead.current?.resolve(v)
    pendingRead.current = null
    setStatus('rodando')
  }

  const statusChip =
    status === 'ok'
      ? 'text-moss-400'
      : status === 'erro' || status === 'falhou'
        ? 'text-coral-400'
        : status === 'rodando' || status === 'aguardando'
          ? 'text-amber-400'
          : 'text-ink-400'

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-6xl flex-col px-4 py-4">
      {exercicio && (
        <div className="mb-3 rounded-lg border border-ink-700 bg-ink-900 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono text-[11px] tracking-wide text-amber-500">
                exercício · {exercicio.categoria}
              </p>
              <h2 className="font-semibold text-ink-100">{exercicio.titulo}</h2>
            </div>
            <Link
              to={`/exercicios/${exercicio.id}`}
              className="rounded-full border border-ink-600 px-3 py-1 text-xs text-ink-300 transition hover:border-ink-400"
            >
              Ver enunciado →
            </Link>
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-ink-800 bg-ink-900 lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2 border-b border-ink-800 px-3 py-2">
            <button
              type="button"
              onClick={rodar}
              disabled={status === 'rodando' || status === 'aguardando'}
              className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-medium text-ink-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ▶ Executar
            </button>
            {exercicio && (
              <button
                type="button"
                onClick={testar}
                disabled={status === 'rodando' || status === 'aguardando'}
                className="rounded-full border border-moss-500/60 px-4 py-1.5 text-sm font-medium text-moss-400 transition hover:bg-moss-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Testar
              </button>
            )}
            <span className={`ml-auto flex items-center gap-1.5 font-mono text-xs ${statusChip}`}>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status === 'rodando' || status === 'aguardando'
                    ? 'animate-pulse bg-amber-500'
                    : status === 'ok'
                      ? 'bg-moss-500'
                      : status === 'erro' || status === 'falhou'
                        ? 'bg-coral-500'
                        : 'bg-ink-500'
                }`}
              />
              {STATUS_LABEL[status]}
            </span>
            <button
              type="button"
              onClick={limparSaida}
              className="rounded-full border border-ink-700 px-3 py-1 text-xs text-ink-400 transition hover:text-ink-200"
            >
              Limpar saída
            </button>
            <button
              type="button"
              onClick={resetCode}
              className="rounded-full border border-ink-700 px-3 py-1 text-xs text-ink-400 transition hover:text-ink-200"
            >
              Reiniciar código
            </button>
          </div>
          <div className="min-h-[260px] flex-1">
            <CodeEditor value={code} onChange={setCode} />
          </div>
        </div>

        <aside className="flex min-h-[220px] flex-col border-t border-ink-800 bg-paper-100 text-ink-950 lg:w-[340px] lg:min-h-0 lg:border-t-0 lg:border-l">
          <div className="flex items-center justify-between border-b border-paper-300 px-3 py-2">
            <span className="font-mono text-xs font-medium text-ink-600">saída</span>
            <span className="font-mono text-[10px] text-ink-500">console</span>
          </div>
          <div
            ref={consoleRef}
            className="flex-1 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 whitespace-pre-wrap"
          >
            {linhas.length === 0 && status === 'parado' && (
              <p className="text-ink-500/70 italic">
                A saída do seu programa aparece aqui.
              </p>
            )}
            {linhas.map((l, i) => (
              <p
                key={i}
                className={
                  l.tipo === 'erro'
                    ? 'text-coral-600 font-medium'
                    : l.tipo === 'entrada'
                      ? 'text-ink-600'
                      : l.tipo === 'sistema'
                        ? 'text-ink-700 whitespace-pre'
                        : 'text-ink-950'
                }
              >
                {l.texto}
              </p>
            ))}
            {(status === 'rodando' || status === 'aguardando') && (
              <span className="inline-block h-4 w-1.5 animate-pulse bg-ink-600" />
            )}
          </div>
          {status === 'aguardando' && (
            <form
              className="flex items-center gap-2 border-t border-paper-300 px-3 py-2"
              onSubmit={(e) => {
                e.preventDefault()
                enviarInput()
              }}
            >
              <span className="font-mono text-ink-600">&gt;</span>
              <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="digite um valor e Enter"
                className="w-full bg-transparent font-mono text-[12.5px] text-ink-950 outline-none placeholder:text-ink-500/60"
              />
            </form>
          )}
        </aside>
      </div>
    </div>
  )
}