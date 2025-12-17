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

export const editMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.userId;
    const { text } = req.body;
    
    // Validate text
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Текст сообщения не может быть пустым'
      });
    }
    
    // Get the message to check ownership
    const message = await Message.getById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Сообщение не найдено'
      });
    }
    
    // Check if user is the sender
    if (message.sender_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Вы можете редактировать только свои сообщения'
      });
    }
    
    // Check if message is deleted
    if (message.is_deleted) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя редактировать удаленное сообщение'
      });
    }
    
    // Update the message
    const updatedMessage = await Message.updateText(messageId, text.trim());
    
    res.json({
      success: true,
      data: {
        message: {
          id: updatedMessage.id,
          senderId: updatedMessage.sender_id,
          senderName: updatedMessage.sender_name,
          text: updatedMessage.text,
          isEdited: updatedMessage.is_edited,
          editedAt: updatedMessage.edited_at,
          isDeleted: updatedMessage.is_deleted,
          deliveredAt: updatedMessage.delivered_at,
          readAt: updatedMessage.read_at,
          createdAt: updatedMessage.created_at
        }
      }
    });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при редактировании сообщения'
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.userId;
    
    // Get the message to check ownership
    const message = await Message.getById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Сообщение не найдено'
      });
    }
    
    // Check if user is the sender
    if (message.sender_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Вы можете удалять только свои сообщения'
      });
    }
    
    // Check if message is already deleted
    if (message.is_deleted) {
      return res.status(400).json({
        success: false,
        message: 'Сообщение уже удалено'
      });
    }
    
    // Soft delete the message
    const deletedMessage = await Message.softDelete(messageId);
    
    res.json({
      success: true,
      data: {
        message: {
          id: deletedMessage.id,
          senderId: deletedMessage.sender_id,
          senderName: deletedMessage.sender_name,
          text: deletedMessage.text,
          isEdited: deletedMessage.is_edited,
          editedAt: deletedMessage.edited_at,
          isDeleted: deletedMessage.is_deleted,
          deliveredAt: deletedMessage.delivered_at,
          readAt: deletedMessage.read_at,
          createdAt: deletedMessage.created_at
        }
      }
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении сообщения'
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
          senderName: message.sender_name,
          text: message.text,
          isEdited: message.is_edited || 0,
          editedAt: message.edited_at,
          isDeleted: message.is_deleted || 0,
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
