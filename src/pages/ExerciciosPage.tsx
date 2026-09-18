import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CATEGORIAS,
  DIFICULDADE_LABEL,
  filtrarExercicios,
} from '../data/exercises'
import type { Categoria, Dificuldade, Exercicio } from '../data/exercises'

function Pontinhos({ nivel }: { nivel: number }) {
  return (
    <span className="flex items-center gap-1" title={DIFICULDADE_LABEL[nivel as Dificuldade]}>
      {[1, 2, 3, 4, 5].map((d) => (
        <span
          key={d}
          className={`h-1.5 w-1.5 rounded-full ${d <= nivel ? 'bg-amber-500' : 'bg-ink-700'}`}
        />
      ))}
    </span>
  )
}

function Card({ e }: { e: Exercicio }) {
  const rotulo = CATEGORIAS.find((c) => c.key === e.categoria)?.rotulo ?? e.categoria
  return (
    <Link
      to={`/exercicios/${e.id}`}
      className="group flex flex-col gap-2 rounded-xl border border-ink-800 bg-ink-900 p-5 transition hover:border-ink-600 hover:bg-ink-850"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full border border-ink-700 px-2.5 py-0.5 font-mono text-[11px] text-ink-300">
          {rotulo}
        </span>
        <Pontinhos nivel={e.dificuldade} />
      </div>
      <h3 className="font-semibold text-ink-100 group-hover:text-ink-200">
        {e.titulo}
      </h3>
      <p className="line-clamp-2 text-sm leading-relaxed text-ink-400">
        {e.enunciado[0]}
      </p>
    </Link>
  )
}

export default function ExerciciosPage() {
  const [categoria, setCategoria] = useState<Categoria | 'todas'>('todas')
  const [dificuldade, setDificuldade] = useState<Dificuldade | 'todas'>('todas')
  const [busca, setBusca] = useState('')

  const lista = useMemo(
    () =>
      filtrarExercicios({
        categoria,
        dificuldade,
        busca: busca.trim() || undefined,
      }),
    [categoria, dificuldade, busca],
  )

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-amber-500">exercícios de lógica</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Pratique no seu ritmo
          </h1>
        </div>
        <Link
          to="/editor"
          className="rounded-full border border-ink-700 px-4 py-2 text-sm text-ink-200 transition hover:border-ink-500"
        >
          Abrir editor livre →
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCategoria('todas')}
            className={`rounded-full px-3 py-1 text-sm transition ${
              categoria === 'todas'
                ? 'bg-amber-500 font-medium text-ink-950'
                : 'border border-ink-700 text-ink-300 hover:border-ink-500'
            }`}
          >
            Todas
          </button>
          {CATEGORIAS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategoria(c.key)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                categoria === c.key
                  ? 'bg-amber-500 font-medium text-ink-950'
                  : 'border border-ink-700 text-ink-300 hover:border-ink-500'
              }`}
            >
              {c.rotulo}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar exercício..."
              className="w-64 rounded-full border border-ink-700 bg-ink-900 py-1.5 pr-3 pl-4 text-sm text-ink-100 outline-none placeholder:text-ink-500 focus:border-amber-500"
            />
          </div>
          <select
            value={dificuldade}
            onChange={(e) => setDificuldade(e.target.value as Dificuldade | 'todas')}
            className="rounded-full border border-ink-700 bg-ink-900 px-3 py-1.5 text-sm text-ink-300 outline-none focus:border-amber-500"
          >
            <option value="todas">Qualquer dificuldade</option>
            <option value={1}>Muito fácil</option>
            <option value={2}>Fácil</option>
            <option value={3}>Médio</option>
            <option value={4}>Difícil</option>
            <option value={5}>Muito difícil</option>
          </select>
          <p className="ml-auto font-mono text-xs text-ink-500">
            {lista.length} exercícios
          </p>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="mt-12 text-center text-ink-400">
          <p className="text-lg">Nenhum exercício encontrado.</p>
          <p className="mt-1 text-sm">Tente outra palavra ou limpe os filtros.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((e) => (
            <Card key={e.id} e={e} />
          ))}
        </div>
      )}
    </section>
  )
}