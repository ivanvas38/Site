import React, { useEffect } from 'react'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import ProfilePage from './components/ProfilePage'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NavigationProvider, useNavigation } from './context/NavigationContext'
import { PrivateRoute } from './components/PrivateRoute'

const App: React.FC = () => {
  return (
    <NavigationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NavigationProvider>
  )
}

const AppContent: React.FC = () => {
  const { currentPage, navigate } = useNavigation()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (
      isAuthenticated &&
      (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register')
    ) {
      navigate('dashboard')
    }

    if (!isAuthenticated && (currentPage === 'dashboard' || currentPage === 'profile')) {
      navigate('login')
    }
  }, [currentPage, isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'register' && <RegisterPage />}
      {currentPage === 'dashboard' && (
        <PrivateRoute>
          <DashboardPage />
        </PrivateRoute>
      )}
      {currentPage === 'profile' && (
        <PrivateRoute>
          <ProfilePage />
        </PrivateRoute>
      )}
    </div>
  )
}

export default App
