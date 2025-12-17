import React from 'react'
import { LogOut, User, Mail, Calendar } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigation } from '../context/NavigationContext'

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth()
  const { navigate } = useNavigation()

  const handleLogout = () => {
    logout()
    navigate('landing')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slideUp">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">TeleApp</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Профиль
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Информация вашего аккаунта
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-slate-700 animate-slideUp">
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Имя пользователя</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ID пользователя</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono text-sm break-all">{user?.id}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-8 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-lg hover:scale-105"
          >
            <LogOut className="w-5 h-5" />
            Выход из аккаунта
          </button>

          <button
            onClick={() => navigate('landing')}
            className="w-full mt-3 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600"
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  )
}
