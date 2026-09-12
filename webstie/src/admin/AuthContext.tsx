import { useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import { AuthContext } from './useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ username: string }>('/auth/me')
      .then((res) => setUsername(res.username))
      .catch(() => setUsername(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (usernameInput: string, password: string) => {
    const res = await api.post<{ username: string }>('/auth/login', { username: usernameInput, password })
    setUsername(res.username)
  }

  const logout = async () => {
    await api.post('/auth/logout', {})
    setUsername(null)
  }

  return <AuthContext.Provider value={{ username, loading, login, logout }}>{children}</AuthContext.Provider>
}
