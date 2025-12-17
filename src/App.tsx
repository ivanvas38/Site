import React from 'react'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AuthProvider } from './context/AuthContext'
import { NavigationProvider, useNavigation } from './context/NavigationContext'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </AuthProvider>
  )
}

const AppContent: React.FC = () => {
  const { currentPage } = useNavigation()

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'register' && <RegisterPage />}
    </div>
  )
}

export default App
