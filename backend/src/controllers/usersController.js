import User from '../models/User.js';

export const getAll = async (req, res) => {
  try {
    const currentUserId = req.userId;
    
    // Get all users except the current one
    const allUsers = await User.getAll();
    const users = allUsers.filter(user => user.id !== currentUserId);
    
    // Remove password_hash from response
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      lastSeenAt: user.last_seen_at,
      isOnline: user.is_online
    }));
    
    res.json({
      success: true,
      data: sanitizedUsers
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении списка пользователей'
    });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    // Remove password_hash from response
    const sanitizedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      lastSeenAt: user.last_seen_at,
      isOnline: user.is_online,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
    
    res.json({
      success: true,
      data: sanitizedUser
    });
  } catch (error) {
    console.error('Error getting user by id:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении пользователя'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { name, avatar } = req.body;
    
    if (!name && !avatar) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать имя или аватар для обновления'
      });
    }
    
    const updatedUser = await User.updateProfile(currentUserId, { name, avatar });
    
    // Remove password_hash from response
    const sanitizedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      lastSeenAt: updatedUser.last_seen_at,
      isOnline: updatedUser.is_online,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    };
    
    res.json({
      success: true,
      data: sanitizedUser,
      message: 'Профиль успешно обновлен'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении профиля'
    });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { avatar } = req.body;
    
    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: 'Аватар обязателен'
      });
    }
    
    const updatedUser = await User.updateProfile(currentUserId, { avatar });
    
    // Remove password_hash from response
    const sanitizedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      lastSeenAt: updatedUser.last_seen_at,
      isOnline: updatedUser.is_online,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    };
    
    res.json({
      success: true,
      data: sanitizedUser,
      message: 'Аватар успешно обновлен'
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении аватара'
    });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const currentUserId = req.userId;
    
    const updatedUser = await User.updateLastSeen(currentUserId);
    
    // Remove password_hash from response
    const sanitizedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      lastSeenAt: updatedUser.last_seen_at,
      isOnline: updatedUser.is_online,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    };
    
    res.json({
      success: true,
      data: sanitizedUser,
      message: 'Активность обновлена'
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении активности'
    });
  }
};

export const getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = await User.getOnlineUsers();
    
    // Remove password_hash from response
    const sanitizedUsers = onlineUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      lastSeenAt: user.last_seen_at,
      isOnline: user.is_online
    }));
    
    res.json({
      success: true,
      data: sanitizedUsers
    });
  } catch (error) {
    console.error('Error getting online users:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении списка онлайн пользователей'
    });
  }
};
