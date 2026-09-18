import { supabase, supabaseConfigurado } from './supabase'
import { exercicioPorId } from '../data/exercises'
import type { Exercicio } from '../data/exercises'

export interface Atividade {
  exercicioId: string
  titulo: string
  resolvidaEm: string
  pontos: number
}

export interface RankingLinha {
  nome: string
  resolvidos: number
  pontos: number
}

export function pontosDe(e: Exercicio): number {
  return e.dificuldade * 10
}

const CHAVE = 'visualg:historico'

export function historicoLocal(): Atividade[] {
  try {
    const raw = localStorage.getItem(CHAVE)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function registrarLocal(atividade: Atividade) {
  const atual = historicoLocal().filter((a) => a.exercicioId !== atividade.exercicioId)
  atual.unshift(atividade)
  localStorage.setItem(CHAVE, JSON.stringify(atual.slice(0, 200)))
}

export async function registrarAtividade(id: string): Promise<void> {
  const e = exercicioPorId(id)
  if (!e) return
  const pontos = pontosDe(e)
  const agora = new Date().toISOString()
  registrarLocal({
    exercicioId: id,
    titulo: e.titulo,
    resolvidaEm: agora,
    pontos,
  })

  if (!supabaseConfigurado || !supabase) return
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) return
  await supabase.from('atividades').upsert(
    {
      user_id: user.id,
      exercicio_id: id,
      concluida: true,
      pontuacao: pontos,
      resolvida_em: agora,
    },
    { onConflict: 'user_id,exercicio_id' },
  )
}

export async function historicoRemoto(): Promise<Atividade[]> {
  if (!supabaseConfigurado || !supabase) return []
  const { data } = await supabase.auth.getUser()
  if (!data.user) return []
  const { data: rows } = await supabase
    .from('atividades')
    .select('exercicio_id, pontuacao, resolvida_em')
    .eq('concluida', true)
    .order('resolvida_em', { ascending: false })
  return (rows ?? []).map((r) => {
    const ex = exercicioPorId(r.exercicio_id)
    return {
      exercicioId: r.exercicio_id,
      titulo: ex?.titulo ?? r.exercicio_id,
      resolvidaEm: r.resolvida_em,
      pontos: r.pontuacao,
    }
  })
}

export async function rankingGeral(): Promise<RankingLinha[]> {
  if (!supabaseConfigurado || !supabase) return []
  const { data } = await supabase.rpc('ranking_geral')
  return (data ?? []) as RankingLinha[]
}