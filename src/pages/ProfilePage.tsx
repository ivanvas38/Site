import React from 'react'
import { ArrowLeft, User, Mail, Calendar } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigation } from '../context/NavigationContext'

export const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const { navigate } = useNavigation()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleBackToDashboard = () => {
    navigate('dashboard')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToDashboard}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Вернуться к мессенджеру"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Мой профиль
            </h1>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-400 px-8 py-12">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-3xl">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {user.name}
              </h2>
              <p className="text-blue-100">
                Активный пользователь мессенджера
              </p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Username */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Имя пользователя
                  </p>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Электронная почта
                  </p>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                    ID
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Идентификатор пользователя
                  </p>
                  <p className="text-lg text-gray-900 dark:text-white font-mono text-sm">
                    {user.id}
                  </p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Дата регистрации
                  </p>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {user.createdAt ? formatDate(user.createdAt) : 'Не указано'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <button
                  onClick={handleBackToDashboard}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Перейти к сообщениям
                </button>
                <button
                  onClick={() => {/* TODO: Add edit profile functionality */}}
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                >
                  Редактировать
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Эта страница показывает основную информацию о вашем аккаунте
          </p>
        </div>
      </div>
    </div>
  )
}