import React from 'react';
import './styles/index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Messenger</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Добро пожаловать в мессенджер!
          </p>
          <p className="text-sm text-gray-500">
            Структура проекта инициализирована. Начните разработку!
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
