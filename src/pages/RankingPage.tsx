import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, supabaseConfigurado } from '../lib/supabase'
import { rankingGeral } from '../lib/atividades'
import type { RankingLinha } from '../lib/atividades'
import { nicknameDe, useUsuario } from '../lib/useAuth'

const VAZIO: RankingLinha[] = []

export default function RankingPage() {
  const user = useUsuario()
  const [linhas, setLinhas] = useState<RankingLinha[]>(VAZIO)
  const [carregando, setCarregando] = useState(true)
  const [meuNome, setMeuNome] = useState('')

  useEffect(() => {
    setMeuNome(nicknameDe(user))
  }, [user])

  useEffect(() => {
    let ativo = true
    if (!supabaseConfigurado) {
      setCarregando(false)
      return () => {
        ativo = false
      }
    }
    rankingGeral().then((r) => {
      if (!ativo) return
      setLinhas(r)
      setCarregando(false)
    })
    return () => {
      ativo = false
    }
  }, [])

  const sair = async () => {
    await supabase?.auth.signOut()
  }

  const minhasLinhas =
    meuNome && linhas.filter((l) => l.nome === meuNome).length > 0

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <p className="font-mono text-xs text-amber-500">quadro de recordes</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Ranking geral</h1>
        <p className="mx-auto mt-2 max-w-md text-ink-400">
          Cada exercício resolvido certo vale 10 pontos por nível de
          dificuldade. Quem acumula mais sobe.
        </p>
      </div>

      {!supabaseConfigurado ? (
        <div className="mt-10 rounded-lg border border-ink-700 bg-ink-900 p-5 text-sm leading-relaxed text-ink-300">
          <p className="font-semibold text-ink-100">Ranking ainda sem conexão.</p>
          <p className="mt-2">
            Coloque as chaves do Supabase no arquivo{' '}
            <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[12px] text-amber-500">
              .env
            </code>{' '}
            e rode o SQL que está em{' '}
            <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[12px] text-amber-500">
              supabase/migrations/0001_atividades.sql
            </code>{' '}
            para o ranking aparecer aqui.
          </p>
        </div>
      ) : carregando ? (
        <div className="mt-14 text-center font-mono text-sm text-ink-500">
          carregando ranking...
        </div>
      ) : linhas.length === 0 ? (
        <div className="mt-14 text-center">
          <p className="text-ink-200">Ainda não tem ninguém no ranking.</p>
          <p className="mt-1 text-sm text-ink-400">
            Resolva um exercício para ser o primeiro!
          </p>
        </div>
      ) : (
        <ol className="mt-8 space-y-2">
          {linhas.map((l, i) => {
            const top3 = i < 3
            const souEu = l.nome === meuNome
            return (
              <li
                key={`${l.nome}-${i}`}
                className={`flex items-center gap-4 rounded-lg border px-4 py-3 transition ${
                  top3
                    ? 'border-amber-500/40 bg-amber-500/10'
                    : 'border-ink-800 bg-ink-900'
                } ${souEu ? 'ring-1 ring-moss-500/50' : ''}`}
              >
                <span className="w-8 shrink-0 text-right font-mono text-sm text-ink-500">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-xs font-bold uppercase ${
                    top3 ? 'bg-amber-500 text-ink-950' : 'bg-ink-800 text-ink-200'
                  }`}
                >
                  {l.nome.trim().charAt(0) || '?'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-medium ${souEu ? 'text-moss-400' : 'text-ink-100'}`}>
                    {l.nome}
                    {souEu && <span className="ml-2 font-mono text-[10px] text-moss-500">você</span>}
                  </p>
                  <p className="font-mono text-[11px] text-ink-500">
                    {l.resolvidos} exercício{l.resolvidos === 1 ? '' : 's'}
                  </p>
                </div>
                <span className="font-mono text-lg font-bold text-amber-500">
                  {l.pontos}
                  <span className="ml-1 text-[10px] font-normal text-ink-500">pts</span>
                </span>
              </li>
            )
          })}
        </ol>
      )}

      <div className="mt-8 rounded-lg border border-ink-800 bg-ink-900 p-4 text-center text-sm">
        {!user && supabaseConfigurado ? (
          <p className="text-ink-300">
            Quer aparecer aqui?{' '}
            <Link to="/cadastro" className="font-medium text-amber-500 hover:text-amber-400">
              Crie uma conta grátis
            </Link>{' '}
            e resolva exercícios.
          </p>
        ) : user ? (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <p className="text-ink-300">
              Sua posição: <span className="font-semibold text-ink-100">{minhasLinhas ? 'aponta no ranking ↑' : 'fora do top 50 ainda'}</span>
            </p>
            <button
              type="button"
              onClick={sair}
              className="rounded-full border border-ink-700 px-4 py-1.5 text-sm text-ink-300 transition hover:border-ink-500 hover:text-ink-100"
            >
              Sair
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}