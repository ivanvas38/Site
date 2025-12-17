/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authApi } from '../utils/api'
import { useNavigation } from './NavigationContext'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  lastSeenAt?: string
  isOnline?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  restoreSession: () => Promise<void>
  updateUser: (userData: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { navigate } = useNavigation()

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
        // API /auth/me возвращает { success: true, data: { user: {...} } }
        // Или { success: true, data: {...} }
        const responseData = response.data as { user?: User } | User
        let userData: User | null = null

        if ('user' in responseData && responseData.user) {
          userData = responseData.user
        } else if ('id' in responseData) {
          userData = responseData as User
        }

        setUser(userData)
      } else {
        // Если ответ неуспешный, очищаем токен
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
      navigate('dashboard')

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
  }, [navigate])

  const register = useCallback(async (email: string, username: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await authApi.register({ email, name, password })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Ошибка регистрации')
      }

      localStorage.setItem('token', result.data.token)
      setUser(result.data.user)
      navigate('dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  const logout = useCallback(() => {
    setUser(null)
    setError(null)
    localStorage.removeItem('token')
    localStorage.removeItem('rememberMe')
    navigate('landing')

    authApi.logout().catch(() => {
      // Ignore logout errors
    })
  }, [navigate])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const updateUser = useCallback((userData: User) => {
    setUser(userData)
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
    restoreSession,
    updateUser,
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
