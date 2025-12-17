/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type PageType = 'landing' | 'login' | 'register' | 'dashboard'

interface NavigationContextType {
  currentPage: PageType
  navigate: (page: PageType) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

const pageToPath: Record<PageType, string> = {
  landing: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
}

const pathToPage = (path: string): PageType => {
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path

  switch (normalized) {
    case '/login':
      return 'login'
    case '/register':
      return 'register'
    case '/dashboard':
      return 'dashboard'
    case '/':
    default:
      return 'landing'
  }
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageType>(() => pathToPage(window.location.pathname))

  const navigate = useCallback(
    (page: PageType) => {
      setCurrentPage(page)
      const nextPath = pageToPath[page]
      if (window.location.pathname !== nextPath) {
        window.history.pushState({}, '', nextPath)
      }
    },
    [setCurrentPage],
  )

  useEffect(() => {
    const onPopState = () => {
      setCurrentPage(pathToPage(window.location.pathname))
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return (
    <NavigationContext.Provider value={{ currentPage, navigate }}>{children}</NavigationContext.Provider>
  )
}

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation должен использоваться внутри NavigationProvider')
  }
  return context
}
