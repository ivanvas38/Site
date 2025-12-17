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
      username: user.username
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
