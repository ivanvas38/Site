import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MessageCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white">
      <nav className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Messenger</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Вход
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
            >
              Регистрация
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <section className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Добро пожаловать в мессенджер!
            </h1>
            <p className="text-lg text-gray-600">
              Общайтесь быстро и удобно. Создайте аккаунт или войдите, чтобы продолжить.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                Начать сейчас
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-white transition flex items-center justify-center"
              >
                Уже есть аккаунт
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              <div>
                <p className="text-2xl font-bold text-gray-900">Безопасно</p>
                <p className="text-gray-600">шифрование и защита данных</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Быстро</p>
                <p className="text-gray-600">моментальная доставка сообщений</p>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-3xl" />
            <div className="relative bg-white rounded-3xl border border-blue-100 shadow-2xl p-8">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2 bg-gray-200 rounded w-24" />
                      <div className="h-2 bg-gray-100 rounded w-36" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-gray-500">
          © {new Date().getFullYear()} Messenger. Все права защищены.
        </div>
      </footer>
    </div>
  );
}
