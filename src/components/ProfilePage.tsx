import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messengerApi } from '../utils/api';
import UserAvatar from './UserAvatar';

interface AvatarCropperProps {
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

const AvatarCropper: React.FC<AvatarCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const [isDragging, setIsDragging] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, size: 100 });

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Update crop area centered on click
    const size = cropArea.size;
    setCropArea({
      x: Math.max(0, Math.min(x - size/2, canvas.width - size)),
      y: Math.max(0, Math.min(y - size/2, canvas.height - size)),
      size: size
    });
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const croppedCanvas = document.createElement('canvas');
    const ctx = croppedCanvas.getContext('2d');
    if (!ctx) return;

    croppedCanvas.width = 200;
    croppedCanvas.height = 200;

    // Create image and crop
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.size, cropArea.size,
        0, 0, 200, 200
      );
      
      const croppedDataUrl = croppedCanvas.toDataURL('image/jpeg', 0.8);
      onCropComplete(croppedDataUrl);
    };
    img.src = imageSrc;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Обрезать аватар</h3>
        
        <div className="relative mb-4">
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="border border-gray-300 rounded cursor-crosshair"
            onClick={handleCanvasClick}
          />
          
          {/* Crop overlay */}
          <div
            className="absolute border-2 border-blue-500 bg-transparent pointer-events-none"
            style={{
              left: cropArea.x,
              top: cropArea.y,
              width: cropArea.size,
              height: cropArea.size,
            }}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleCrop}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1"
          >
            Применить
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex-1"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameUpdate = async () => {
    if (!name.trim()) {
      setError('Имя не может быть пустым');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await messengerApi.updateProfile({ name: name.trim() });
      if (response.success && response.data) {
        updateUser(response.data);
        setIsEditing(false);
      } else {
        setError(response.error || 'Ошибка обновления профиля');
      }
    } catch (err) {
      setError('Ошибка обновления профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер файла не должен превышать 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Выберите файл изображения');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarCrop = async (croppedDataUrl: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await messengerApi.updateAvatar(croppedDataUrl);
      if (response.success && response.data) {
        updateUser(response.data);
        setShowCropper(false);
        setSelectedImage(null);
      } else {
        setError(response.error || 'Ошибка обновления аватара');
      }
    } catch (err) {
      setError('Ошибка обновления аватара');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityUpdate = async () => {
    try {
      await messengerApi.updateActivity();
    } catch (err) {
      console.error('Failed to update activity:', err);
    }
  };

  React.useEffect(() => {
    // Update activity every 30 seconds
    const interval = setInterval(handleActivityUpdate, 30000);
    
    // Update activity on user interaction
    const handleUserActivity = () => handleActivityUpdate();
    
    document.addEventListener('mousedown', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);
    
    // Initial activity update
    handleActivityUpdate();

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Профиль пользователя</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <UserAvatar user={user} size="xl" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите ваше имя"
                  disabled={isLoading}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleNameUpdate}
                    disabled={isLoading || !name.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name);
                      setError(null);
                    }}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-sm text-gray-600">
                    {user.isOnline ? 'В сети' : 'Не в сети'}
                  </span>
                  {user.lastSeenAt && (
                    <span className="text-sm text-gray-500">
                      последняя активность: {new Date(user.lastSeenAt).toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-semibold mb-3">Информация о профиле</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>ID пользователя:</span>
              <span>{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Дата регистрации:</span>
              <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : 'Неизвестно'}</span>
            </div>
            {user.updatedAt && (
              <div className="flex justify-between">
                <span>Последнее обновление:</span>
                <span>{new Date(user.updatedAt).toLocaleDateString('ru-RU')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCropper && selectedImage && (
        <AvatarCropper
          imageSrc={selectedImage}
          onCropComplete={handleAvatarCrop}
          onCancel={() => {
            setShowCropper(false);
            setSelectedImage(null);
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;