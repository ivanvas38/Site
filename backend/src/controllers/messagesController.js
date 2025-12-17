import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

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
