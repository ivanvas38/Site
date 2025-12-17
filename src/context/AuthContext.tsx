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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await authApi.getCurrentUser()
      if (response.success && response.data) {
        // Handle potentially different response structures
        const data = response.data as any
        const userData = data.user || data
        setUser(userData as User)
      } else {
        localStorage.removeItem('token')
      }
    } catch (err) {
      console.error('Session restoration failed:', err)
      localStorage.removeItem('token')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await authApi.login({ email, password, rememberMe })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Ошибка входа')
      }

      localStorage.setItem('token', result.data.token)
      setUser(result.data.user)
      
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

      const result = await authApi.register({ email, username, password })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Ошибка регистрации')
      }

      localStorage.setItem('token', result.data.token)
      setUser(result.data.user)
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
    
    authApi.logout().catch(() => {
      // Ignore logout errors
    })
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
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
