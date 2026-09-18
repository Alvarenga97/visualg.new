import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase'
import { historicoLocal, historicoRemoto } from '../lib/atividades'
import type { Atividade } from '../lib/atividades'
import { nicknameDe, useUsuario } from '../lib/useAuth'

function formatoData(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function HistoricoPage() {
  const user = useUsuario()
  const [locais, setLocais] = useState<Atividade[]>([])
  const [remotas, setRemotas] = useState<Atividade[] | null>(null)

  const logadoESincronizado = supabaseConfigurado && remotas !== null

  useEffect(() => {
    setLocais(historicoLocal())
    if (supabaseConfigurado && user) {
      setRemotas(null)
      historicoRemoto().then(setRemotas)
    } else {
      setRemotas(null)
    }
  }, [user])

  const itens = logadoESincronizado ? (remotas ?? []) : locais
  const pontosTotais = itens.reduce((soma, a) => soma + a.pontos, 0)

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-amber-500">seu progresso</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Histórico</h1>
          <p className="mt-2 text-ink-400">
            {logadoESincronizado
              ? `Olá, ${nicknameDe(user)}. Seus exercícios resolvidos estão sincronizados.`
              : 'Estes exercícios ficam salvos neste navegador. Com uma conta, eles sincronizam em qualquer lugar.'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-bold text-amber-500">
            {pontosTotais}
          </p>
          <p className="font-mono text-[11px] text-ink-500">pontos</p>
        </div>
      </div>

      {!logadoESincronizado && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-700 bg-ink-900 px-4 py-3">
          <p className="text-sm text-ink-300">
            Quer que seu histórico valha no ranking? Crie uma conta grátis.
          </p>
          <Link
            to="/cadastro"
            className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-medium text-ink-950 transition hover:bg-amber-400"
          >
            Criar conta
          </Link>
        </div>
      )}

      {itens.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-ink-700 p-10 text-center">
          <p className="text-lg text-ink-200">Nenhum exercício resolvido ainda.</p>
          <p className="mt-1 text-sm text-ink-400">
            Abra um exercício e acerte no "Testar" para ele entrar aqui.
          </p>
          <Link
            to="/exercicios"
            className="mt-6 inline-block rounded-full bg-amber-500 px-5 py-2.5 font-medium text-ink-950 transition hover:bg-amber-400"
          >
            Ver exercícios
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {itens.map((a) => (
            <li
              key={a.exercicioId}
              className="flex items-center gap-4 rounded-lg border border-ink-800 bg-ink-900 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <Link
                  to={`/exercicios/${a.exercicioId}`}
                  className="font-medium text-ink-100 transition hover:text-amber-400"
                >
                  {a.titulo}
                </Link>
                <p className="font-mono text-[11px] text-ink-500">
                  {formatoData(a.resolvidaEm)}
                </p>
              </div>
              <span className="font-mono text-sm text-moss-400">
                +{a.pontos} pts
              </span>
              <Link
                to={`/editor?exercicio=${a.exercicioId}`}
                className="rounded-full border border-ink-700 px-3 py-1 text-xs text-ink-300 transition hover:border-ink-500"
              >
                Refazer →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}