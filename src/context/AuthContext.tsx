/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authApi } from '../utils/api'

export interface User {
  id: string
  email: string
  username: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  restoreSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authApi.login({ email, password, rememberMe })

      if (!response.success) {
        throw new Error(response.error || 'Ошибка входа')
      }

      const { user: userData, token } = response.data || {}
      if (!userData || !token) {
        throw new Error('Неверный ответ сервера')
      }

      localStorage.setItem('token', token)
      setUser(userData)

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string, username: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authApi.register({ email, username, password })

      if (!response.success) {
        throw new Error(response.error || 'Ошибка регистрации')
      }

      const { user: userData, token } = response.data || {}
      if (!userData || !token) {
        throw new Error('Неверный ответ сервера')
      }

      localStorage.setItem('token', token)
      setUser(userData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setError(null)
    localStorage.removeItem('token')
    localStorage.removeItem('rememberMe')
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const restoreSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await authApi.getCurrentUser()
      if (response.success && response.data?.user) {
        setUser(response.data.user)
      } else {
        localStorage.removeItem('token')
      }
    } catch (err) {
      console.error('Failed to restore session:', err)
      localStorage.removeItem('token')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    restoreSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  return context
}
