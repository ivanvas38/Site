import React, { useState } from 'react'
import { Mail, User, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'

interface FormErrors {
  email?: string
  username?: string
  password?: string
  confirmPassword?: string
}

export const RegisterPage: React.FC = () => {
  const { navigate } = useNavigation()
  const { register, isLoading, error: authError } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email обязателен'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный адрес email'
    }

    if (!formData.username) {
      newErrors.username = 'Имя пользователя обязательно'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Имя пользователя должно быть минимум 3 символа'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Используйте только буквы, цифры и подчеркивание'
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен быть минимум 8 символов'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать прописные, строчные буквы и цифры'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтверждение пароля обязательно'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await register(formData.email, formData.username, formData.password)
      setSuccess(true)
      setTimeout(() => {
        navigate('login')
      }, 2000)
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Registration failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slideUp">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">TeleApp</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Создайте аккаунт
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Присоединитесь к миллионам пользователей
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-slate-700 animate-slideUp">
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Регистрация успешна! Перенаправление...
              </p>
            </div>
          )}

          {authError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="вы@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 transition focus:outline-none dark:bg-slate-800 dark:text-white ${
                    errors.email
                      ? 'border-red-500 dark:border-red-400 focus:border-red-500'
                      : 'border-gray-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Имя пользователя
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="ваше_имя"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 transition focus:outline-none dark:bg-slate-800 dark:text-white ${
                    errors.username
                      ? 'border-red-500 dark:border-red-400 focus:border-red-500'
                      : 'border-gray-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
                  }`}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Минимум 8 символов"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 transition focus:outline-none dark:bg-slate-800 dark:text-white ${
                    errors.password
                      ? 'border-red-500 dark:border-red-400 focus:border-red-500'
                      : 'border-gray-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Используйте прописные, строчные буквы и цифры
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Подтвердите пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Повторите пароль"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 transition focus:outline-none dark:bg-slate-800 dark:text-white ${
                    errors.confirmPassword
                      ? 'border-red-500 dark:border-red-400 focus:border-red-500'
                      : 'border-gray-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || success}
              className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                isLoading || success
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:scale-105'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Регистрация...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Успешно!
                </>
              ) : (
                'Создать аккаунт'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Уже есть аккаунт?{' '}
              <button
                onClick={() => navigate('login')}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Войти
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Создавая аккаунт, вы соглашаетесь с{' '}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              условиями использования
            </a>
            {' '}и{' '}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              политикой конфиденциальности
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
