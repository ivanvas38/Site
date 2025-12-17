import React from 'react'
import { MessageCircle, Zap, Lock, Users, ChevronRight, Play } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'

export const LandingPage: React.FC = () => {
  const { navigate } = useNavigation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              TeleApp
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('login')}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            >
              Авторизация
            </button>
            <button
              onClick={() => navigate('register')}
              className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Регистрация
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8 animate-slideUp">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Общайтесь без границ
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-xl">
                  Современное приложение для общения с минималистичным дизайном. Быстро, безопасно и удобно.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('register')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Начать сейчас
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 border-2 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Смотреть демо
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-200 dark:border-slate-700">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    1M+
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    активных пользователей
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    99.9%
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    время работы
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Illustration */}
            <div className="relative animate-fadeIn">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-8 border border-blue-200 dark:border-slate-600 shadow-2xl">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg">
                      <div className="w-12 h-12 bg-blue-200 dark:bg-blue-900 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                        <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded w-32"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Почему выбирают нас
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Современные функции для комфортного общения
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Молниеносная скорость
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Оптимизированная архитектура обеспечивает мгновенную загрузку и отзывчивость
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Высокая безопасность
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Защита данных на уровне военных стандартов с end-to-end шифрованием
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Легкое общение
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Интуитивный интерфейс позволяет начать общаться всего в несколько кликов
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="text-4xl font-bold">
              Готовы присоединиться?
            </h2>
            <p className="text-lg opacity-90">
              Создайте аккаунт за несколько секунд и начните общаться прямо сейчас
            </p>
            <button
              onClick={() => navigate('register')}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
            >
              Зарегистрироваться бесплатно
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-700 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-gray-900 dark:text-white">TeleApp</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Современное приложение для общения
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Продукт</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600 transition">Возможности</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">Цены</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">Безопасность</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Компания</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600 transition">О нас</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">Блог</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">Карьера</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Правовая информация</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600 transition">Политика конфиденциальности</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">Условия использования</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-slate-700 pt-8 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 TeleApp. Все права защищены.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-blue-600 transition">Twitter</a>
              <a href="#" className="hover:text-blue-600 transition">GitHub</a>
              <a href="#" className="hover:text-blue-600 transition">Telegram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
