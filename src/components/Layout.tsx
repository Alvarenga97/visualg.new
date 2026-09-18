import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { nicknameDe, useUsuario } from '../lib/useAuth'

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3.5 py-1.5 text-sm transition ${
    isActive
      ? 'bg-ink-800 font-medium text-ink-100'
      : 'text-ink-400 hover:bg-ink-850 hover:text-ink-200'
  }`

export default function Layout() {
  const user = useUsuario()
  const navigate = useNavigate()

  const sair = async () => {
    await supabase?.auth.signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink-950">
      <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <NavLink to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-amber-500 font-mono text-sm font-bold text-ink-950">
              {'{ }'}
            </span>
            <span className="text-[15px]">
              Visualg<span className="text-amber-500">.new</span>
            </span>
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to="/exercicios" className={linkCls}>
              Exercícios
            </NavLink>
            <NavLink to="/editor" className={linkCls}>
              Editor
            </NavLink>
            <NavLink to="/historico" className={linkCls}>
              Histórico
            </NavLink>
            <NavLink to="/ranking" className={linkCls}>
              Ranking
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-2 rounded-full border border-ink-700 px-3.5 py-1.5 text-sm text-ink-200 sm:flex">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-500 text-[10px] font-bold uppercase text-ink-950">
                    {(nicknameDe(user).charAt(0) || '?').toUpperCase()}
                  </span>
                  {nicknameDe(user)}
                </span>
                <button
                  type="button"
                  onClick={sair}
                  className="rounded-full border border-ink-700 px-3.5 py-1.5 text-sm text-ink-300 transition hover:border-ink-500 hover:text-ink-100"
                >
                  Sair
                </button>
              </div>
            ) : (
              <>
                <NavLink
                  to="/entrar"
                  className="rounded-full border border-ink-700 px-3.5 py-1.5 text-sm text-ink-300 transition hover:border-ink-500 hover:text-ink-100"
                >
                  Entrar
                </NavLink>
                <NavLink
                  to="/cadastro"
                  className="rounded-full bg-amber-500 px-3.5 py-1.5 text-sm font-medium text-ink-950 transition hover:bg-amber-400"
                >
                  Criar conta
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-ink-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Visualg.new — aprenda lógica de programação com Portugol.</p>
          <p className="font-mono text-ink-500">algoritmo → ideia → código</p>
        </div>
      </footer>
    </div>
  )
}