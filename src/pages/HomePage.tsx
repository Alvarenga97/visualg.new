import { Link } from 'react-router-dom'
import { tokenizeHighlight } from '../portugol/highlight'

const SAMPLE = `algoritmo "meu primeiro algoritmo"
var
  nome: caractere
  idade: inteiro
inicio
  escreva("Como você se chama? ")
  leia(nome)
  escreva("Quantos anos você tem? ")
  leia(idade)
  escreval("olá ", nome, ", daqui a 10 anos você terá ", idade + 10)
fim_algoritmo`

export default function HomePage() {
  const segments = tokenizeHighlight(SAMPLE)
  const noCls = new Set(['id', 'ws', 'nl', 'op'])
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="grid items-center gap-12 py-16 lg:grid-cols-[1fr_1.1fr] lg:py-24">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900 px-3 py-1 font-mono text-xs text-ink-300">
            <span className="h-1.5 w-1.5 rounded-full bg-moss-500" />
            IDE Portugol direto no navegador
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Aprenda lógica
            <br />
            escrevendo de verdade.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-300">
            Escreva seu primeiro algoritmo em Portugol, rode na hora e avance
            pelos exercícios — do básico ao avançado. Sem instalar nada e sem
            precisar de conta.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/editor"
              className="rounded-full bg-amber-500 px-6 py-3 font-medium text-ink-950 transition hover:bg-amber-400"
            >
              Abrir o editor
            </Link>
            <Link
              to="/exercicios"
              className="rounded-full border border-ink-700 px-6 py-3 font-medium text-ink-200 transition hover:border-ink-500 hover:text-ink-100"
            >
              Ver exercícios
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-amber-500/15 via-transparent to-moss-500/15 blur-xl" />
          <div className="relative overflow-hidden rounded-xl border border-ink-800 bg-ink-900 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-ink-800 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-coral-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-moss-500" />
              <span className="ml-2 font-mono text-xs text-ink-400">
                meu-programa.algo
              </span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-6 whitespace-pre text-ink-100">
              <code>
                {segments.map((s, i) => (
                  <span
                    key={i}
                    className={noCls.has(s.cls) ? undefined : `tok-${s.cls}`}
                  >
                    {s.text}
                  </span>
                ))}
              </code>
            </pre>
            <div className="flex items-center justify-between border-t border-ink-800 px-4 py-2.5 font-mono text-xs text-ink-400">
              <span>executando...</span>
              <span className="text-moss-400">olá maria, daqui a 10 anos você terá 25</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 pb-20 sm:grid-cols-3">
        {[
          {
            kw: '01',
            titulo: 'Editor que entende Portugol',
            texto: 'Sintaxe destacada, console e execução passo a passo no navegador.',
          },
          {
            kw: '02',
            titulo: 'Dezenas de exercícios',
            texto: 'Organizados por assunto e dificuldade, da primeira variável ao vetor.',
          },
          {
            kw: '03',
            titulo: 'Histórico e ranking',
            texto: 'Use tudo sem conta. Entre só quando quiser guardar seu histórico e disputar o ranking geral.',
          },
        ].map((item) => (
          <div
            key={item.kw}
            className="rounded-xl border border-ink-800 bg-ink-900 p-5"
          >
            <p className="font-mono text-xs text-amber-500">{item.kw}</p>
            <h3 className="mt-2 font-semibold text-ink-100">{item.titulo}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{item.texto}</p>
          </div>
        ))}
      </div>
    </section>
  )
}