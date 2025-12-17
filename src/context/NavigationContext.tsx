/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react'

export type PageType = 'landing' | 'login' | 'register' | 'dashboard'

interface NavigationContextType {
  currentPage: PageType
  navigate: (page: PageType) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('landing')

  const navigate = (page: PageType) => {
    setCurrentPage(page)
  }

  return (
    <NavigationContext.Provider value={{ currentPage, navigate }}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation должен использоваться внутри NavigationProvider')
  }
  return context
}
