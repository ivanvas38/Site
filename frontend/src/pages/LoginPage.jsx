import React from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Вход</h1>
        <p className="text-gray-600 mb-6">Введите данные аккаунта для авторизации</p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Войти
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600 flex items-center justify-between">
          <Link to="/" className="hover:text-blue-600">
            На главную
          </Link>
          <Link to="/register" className="hover:text-blue-600">
            Нет аккаунта? Регистрация
          </Link>
        </div>
      </div>
    </div>
  );
}
