import React, { useState } from 'react'
import { LockKeyhole, ShieldCheck } from 'lucide-react'

export function AdminLayout({ children }) {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD
    if (password === adminPassword) {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Senha incorreta')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <div className="login-icon">
            <LockKeyhole size={28} />
          </div>
          <h2>Acesso admin</h2>
          <p className="login-helper">Entre para atualizar resultados e ranking.</p>
          <form onSubmit={handleLogin}>
            {error && <div className="error-message">{error}</div>}
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
            <button type="submit" className="btn-submit">Entrar</button>
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
        <button onClick={() => setIsAuthenticated(false)} className="btn-logout">
          Sair
        </button>
      </div>
      {children}
    </div>
  )
}
