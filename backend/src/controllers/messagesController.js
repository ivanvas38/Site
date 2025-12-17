import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

export const markAsDelivered = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.userId;

    // Get the message to check if user has access
    const message = await Message.getById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Сообщение не найдено'
      });
    }

    // Check if user is a participant in the conversation
    const conversation = await Conversation.findById(message.conversation_id);
    if (!conversation || (conversation.user1_id !== userId && conversation.user2_id !== userId)) {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этому сообщению'
      });
    }

    // Mark as delivered if not already marked
    await Message.markAsDelivered(messageId);

    res.json({
      success: true,
      message: 'Сообщение отмечено как доставленное'
    });
  } catch (error) {
    console.error('Error marking message as delivered:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при отметке сообщения как доставленного'
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.userId;

    // Get the message to check if user has access
    const message = await Message.getById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Сообщение не найдено'
      });
    }

    // Check if user is a participant in the conversation
    const conversation = await Conversation.findById(message.conversation_id);
    if (!conversation || (conversation.user1_id !== userId && conversation.user2_id !== userId)) {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этому сообщению'
      });
    }

    // Mark as read if not already marked
    await Message.markAsRead(messageId);

    res.json({
      success: true,
      message: 'Сообщение отмечено как прочитанное'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при отметке сообщения как прочитанного'
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { conversationId, recipientId, text } = req.body;
    
    // Validate text
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Текст сообщения не может быть пустым'
      });
    }
    
    let conversation;
    
    // If conversationId is provided, use existing conversation
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Диалог не найден'
        });
      }
      
      // Check if sender is a participant
      if (conversation.user1_id !== senderId && conversation.user2_id !== senderId) {
        return res.status(403).json({
          success: false,
          message: 'У вас нет доступа к этому диалогу'
        });
      }
    } 
    // If recipientId is provided, create or find conversation
    else if (recipientId) {
      // Check if conversation already exists
      conversation = await Conversation.findByUsers(senderId, recipientId);
      
      // Create new conversation if it doesn't exist
      if (!conversation) {
        conversation = await Conversation.create(senderId, recipientId);
      }
    } 
    else {
      return res.status(400).json({
        success: false,
        message: 'Требуется conversationId или recipientId'
      });
    }
    
    // Create message
    const message = await Message.create(conversation.id, senderId, text.trim());
    
    // Update conversation timestamp
    await Conversation.updateTimestamp(conversation.id);
    
    res.json({
      success: true,
      data: {
        message: {
          id: message.id,
          senderId: message.sender_id,
          senderUsername: message.sender_username,
          text: message.text,
          deliveredAt: message.delivered_at,
          readAt: message.read_at,
          createdAt: message.created_at
        },
        conversation: {
          id: conversation.id,
          user1Id: conversation.user1_id,
          user2Id: conversation.user2_id
        }
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при отправке сообщения'
    });
  }
};
