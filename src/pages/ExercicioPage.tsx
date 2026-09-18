import { Link, useParams } from 'react-router-dom'
import { CATEGORIAS, DIFICULDADE_LABEL, exercicioPorId } from '../data/exercises'
import type { Dificuldade } from '../data/exercises'

export default function ExercicioPage() {
  const { id } = useParams()
  const e = id ? exercicioPorId(id) : undefined

  if (!e) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Exercício não encontrado.</h1>
        <p className="mt-2 text-ink-400">Essa atividade pode ter sido movida.</p>
        <Link
          to="/exercicios"
          className="mt-6 inline-block rounded-full bg-amber-500 px-5 py-2.5 font-medium text-ink-950 transition hover:bg-amber-400"
        >
          Ver todos os exercícios
        </Link>
      </section>
    )
  }

  const rotulo = CATEGORIAS.find((c) => c.key === e.categoria)?.rotulo ?? e.categoria

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/exercicios"
        className="font-mono text-sm text-ink-400 transition hover:text-ink-200"
      >
        ← Todos os exercícios
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-ink-700 px-3 py-1 font-mono text-xs text-amber-500">
          {rotulo}
        </span>
        <div className="flex items-center gap-1.5" title={DIFICULDADE_LABEL[e.dificuldade as Dificuldade]}>
          {[1, 2, 3, 4, 5].map((d) => (
            <span
              key={d}
              className={`h-1.5 w-1.5 rounded-full ${d <= e.dificuldade ? 'bg-amber-500' : 'bg-ink-700'}`}
            />
          ))}
          <span className="ml-1 font-mono text-xs text-ink-400">
            {DIFICULDADE_LABEL[e.dificuldade as Dificuldade]}
          </span>
        </div>
      </div>

      <h1 className="mt-3 text-3xl font-bold tracking-tight">{e.titulo}</h1>

      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink-200">
        {e.enunciado.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {(e.entrada || e.saida ? true : false) && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {e.entrada !== undefined && (
            <div className="rounded-lg border border-ink-800 bg-ink-900 p-4">
              <p className="font-mono text-[11px] text-ink-400">entrada</p>
              <pre className="mt-2 font-mono text-sm text-ink-100 whitespace-pre-wrap">
                {e.entrada}
              </pre>
            </div>
          )}
          {e.saida !== undefined && (
            <div className="rounded-lg border border-ink-800 bg-ink-900 p-4">
              <p className="font-mono text-[11px] text-ink-400">saída esperada</p>
              <pre className="mt-2 font-mono text-sm whitespace-pre-wrap text-moss-400">
                {e.saida}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link
          to={`/editor?exercicio=${e.id}`}
          className="rounded-full bg-amber-500 px-6 py-3 text-center font-medium text-ink-950 transition hover:bg-amber-400"
        >
          Resolver no editor
        </Link>
        <Link
          to="/editor"
          className="rounded-full border border-ink-700 px-6 py-3 text-center text-ink-200 transition hover:border-ink-500"
        >
          Editor livre
        </Link>
      </div>

      {e.dica && (
        <details className="group mt-8 rounded-lg border border-ink-800 bg-ink-900 open:pb-1">
          <summary className="cursor-pointer px-4 py-3 font-medium text-ink-200">
            Preciso de uma dica
          </summary>
          <p className="px-4 pb-3 text-sm leading-relaxed text-ink-400">{e.dica}</p>
        </details>
      )}

      <details className="group mt-3 rounded-lg border border-ink-800 bg-ink-900">
        <summary className="cursor-pointer px-4 py-3 font-medium text-ink-200">
          Ver solução (tente antes!)
        </summary>
        <pre className="overflow-x-auto px-4 pb-4 font-mono text-[12.5px] leading-6 text-ink-200 whitespace-pre">
          {e.gabarito}
        </pre>
      </details>
    </section>
  )
}