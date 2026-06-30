import React, { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { LockKeyhole, ShieldCheck } from 'lucide-react'

export function AdminLayout({ children }) {
  const [email, setEmail] = useState(import.meta.env.VITE_ADMIN_EMAIL || '')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const allowedAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase()

  useEffect(() => {
    let mounted = true

  async function loadSession() {
      try {
        if (!allowedAdminEmail) {
          if (mounted) {
            setError('Defina VITE_ADMIN_EMAIL para habilitar o admin.')
            setIsAuthenticated(false)
            setLoading(false)
          }
          return
        }

      if (!isSupabaseConfigured) {
        if (mounted) {
          setLoading(false)
        }
          return
        }

        const { data } = await supabase.auth.getSession()
        const session = data?.session || null
      const sessionEmail = session?.user?.email?.trim().toLowerCase() || ''

      if (!mounted) return

      const isAllowed = sessionEmail === allowedAdminEmail

      setIsAuthenticated(isAllowed)
      } catch {
        if (mounted) {
          setIsAuthenticated(false)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionEmail = session?.user?.email?.trim().toLowerCase() || ''
      const isAllowed = allowedAdminEmail
        ? sessionEmail === allowedAdminEmail
        : Boolean(session)

      setIsAuthenticated(isAllowed)
      setLoading(false)
    })

    return () => {
      mounted = false
      authListener?.subscription?.unsubscribe()
    }
  }, [allowedAdminEmail])

  async function handleLogin(e) {
    e.preventDefault()

    if (!isSupabaseConfigured) {
      setError('Configure o Supabase para usar o acesso admin.')
      return
    }

    if (!allowedAdminEmail) {
      setError('Defina VITE_ADMIN_EMAIL antes de entrar no painel.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (signInError) {
      setError(signInError.message || 'Nao foi possivel entrar')
      setLoading(false)
      return
    }

    const sessionEmail = data?.user?.email?.trim().toLowerCase() || data?.session?.user?.email?.trim().toLowerCase() || ''
    const isAllowed = sessionEmail === allowedAdminEmail

    if (!isAllowed) {
      await supabase.auth.signOut()
      setError('Este usuario nao tem acesso ao painel administrativo.')
      setLoading(false)
      return
    }

    setIsAuthenticated(true)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setPassword('')
    setError('')
  }

  if (loading) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <p className="loading">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <div className="login-icon">
            <LockKeyhole size={28} />
          </div>
          <h2>Acesso admin</h2>
          <p className="login-helper">Entre com seu usuario Supabase para atualizar resultados e ranking.</p>
          <form onSubmit={handleLogin}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite o email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-password">Senha</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                required
              />
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>Entrar</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div className="admin-header-title">
          <ShieldCheck size={18} />
          <h1>Painel administrativo</h1>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Sair
        </button>
      </div>
      {children}
    </div>
  )
}
