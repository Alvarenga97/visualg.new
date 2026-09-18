import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, supabaseConfigurado } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState('')
  const [carregando, setCarregando] = useState(false)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setErro('')
    setOk('')
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })
    setCarregando(false)
    if (error) {
      setErro(error.message)
      return
    }
    setOk('Entrou! Redirecionando...')
    navigate('/')
  }

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-16">
      <p className="font-mono text-xs text-amber-500">sua conta</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Entrar</h1>
      <p className="mt-2 text-ink-400">
        Guarde seu histórico de exercícios e entre no ranking geral. Usar o
        editor não precisa de conta.
      </p>

      {!supabaseConfigurado ? (
        <div className="mt-8 rounded-lg border border-ink-700 bg-ink-900 p-5 text-sm leading-relaxed text-ink-300">
          <p className="font-semibold text-ink-100">Login ainda não conectado.</p>
          <p className="mt-2">
            Para ativar, cadastre as chaves do Supabase no arquivo{' '}
            <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[12px] text-amber-500">
              .env
            </code>{' '}
            da pasta do projeto:
          </p>
          <pre className="mt-3 overflow-x-auto rounded bg-ink-950 p-3 font-mono text-[12px] text-ink-200 whitespace-pre">
            {'VITE_SUPABASE_URL=\nVITE_SUPABASE_ANON_KEY='}
          </pre>
          <p className="mt-2">Depois é só recarregar — as chaves nunca sobem pro Git.</p>
        </div>
      ) : (
        <form onSubmit={enviar} className="mt-8 space-y-4">
          {ok && (
            <p className="rounded-lg bg-moss-500/10 px-4 py-2.5 text-sm text-moss-400">
              {ok}
            </p>
          )}
          {erro && (
            <p className="rounded-lg bg-coral-500/10 px-4 py-2.5 text-sm text-coral-400">
              {erro}
            </p>
          )}
          <label className="block">
            <span className="text-sm text-ink-300">E-mail</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-ink-100 outline-none focus:border-amber-500"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink-300">Senha</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-ink-100 outline-none focus:border-amber-500"
            />
          </label>
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-full bg-amber-500 px-6 py-3 font-medium text-ink-950 transition hover:bg-amber-400 disabled:opacity-50"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="text-center text-sm text-ink-400">
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="text-amber-500 hover:text-amber-400">
              Criar conta
            </Link>
          </p>
        </form>
      )}
    </section>
  )
}