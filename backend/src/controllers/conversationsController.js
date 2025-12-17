import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

export const getConversations = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get all conversations for the user
    const conversations = await Conversation.findByUserId(userId);
    
    // For each conversation, get the other user and last message
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        // Determine the other user
        const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
        const otherUser = await User.findById(otherUserId);
        
        // Get last message
        const lastMessage = await Conversation.getLastMessage(conv.id);
        
        return {
          id: conv.id,
          otherUser: {
            id: otherUser.id,
            email: otherUser.email,
            username: otherUser.username
          },
          lastMessage: lastMessage ? {
            text: lastMessage.text,
            deliveredAt: lastMessage.delivered_at,
            readAt: lastMessage.read_at,
            createdAt: lastMessage.created_at
          } : null,
          updatedAt: conv.updated_at
        };
      })
    );
    
    res.json({
      success: true,
      data: conversationsWithDetails
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении диалогов'
    });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const conversationId = parseInt(req.params.id);
    
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Диалог не найден'
      });
    }
    
    // Check if the user is a participant
    if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этому диалогу'
      });
    }
    
    // Get messages
    const Message = (await import('../models/Message.js')).default;
    const messages = await Message.getByConversationId(conversationId);
    
    // Format messages
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      senderUsername: msg.sender_username,
      text: msg.text,
      deliveredAt: msg.delivered_at,
      readAt: msg.read_at,
      createdAt: msg.created_at
    }));
    
    res.json({
      success: true,
      data: formattedMessages
    });
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении сообщений'
    });
  }
};

export const createConversation = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.body;
    
    if (!user1Id || !user2Id) {
      return res.status(400).json({
        success: false,
        message: 'Требуются оба ID пользователей'
      });
    }
    
    const conversation = await Conversation.create(user1Id, user2Id);
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании диалога'
    });
  }
};
