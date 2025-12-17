import React from 'react';

interface UserAvatarProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
};

const statusSizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md', 
  showOnlineStatus = true,
  className = '' 
}) => {
  const generateInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getAvatarContent = () => {
    if (user.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // If image fails to load, show initials instead
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }
    
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium flex items-center justify-center rounded-full">
        {generateInitials(user.name)}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
        {getAvatarContent()}
      </div>
      
      {showOnlineStatus && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${statusSizeClasses[size]} rounded-full border-2 border-white ${
          user.isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      )}
    </div>
  );
};

export default UserAvatar;