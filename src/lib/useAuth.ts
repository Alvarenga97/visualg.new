import { useEffect, useState } from 'react'
import { supabase, supabaseConfigurado } from './supabase'
import type { User } from '@supabase/supabase-js'

export function useUsuario() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!supabaseConfigurado || !supabase) return
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setUser(sessao?.user ?? null)
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  return user
}

export function nicknameDe(
  user: Pick<User, 'email' | 'user_metadata'> | null | undefined,
): string {
  const n = user?.user_metadata?.nickname as string | undefined
  if (n && n.trim()) return n.trim()
  const email = user?.email
  return email ? email.split('@')[0] : 'sem nome'
}