import { executeQuery } from '../config/database.js';

class Message {
  static async create(conversationId, senderId, text) {
    try {
      const [result] = await executeQuery(
        'INSERT INTO messages (conversation_id, sender_id, text) VALUES (?, ?, ?)',
        [conversationId, senderId, text]
      );
      
      // Get the created message with sender info
      const [rows] = await executeQuery(
        `SELECT m.*, u.name as sender_name 
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.id = ?`,
        [result.insertId]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async getByConversationId(conversationId) {
    try {
      const [rows] = await executeQuery(
        `SELECT m.*, u.name as sender_name 
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.conversation_id = ?
         ORDER BY m.created_at ASC`,
        [conversationId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async markAsDelivered(messageId) {
    try {
      await executeQuery(
        'UPDATE messages SET delivered_at = CURRENT_TIMESTAMP WHERE id = ? AND delivered_at IS NULL',
        [messageId]
      );
    } catch (error) {
      throw error;
    }
  }

  static async markAsRead(messageId) {
    try {
      await executeQuery(
        'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND read_at IS NULL',
        [messageId]
      );
    } catch (error) {
      throw error;
    }
  }

  static async getById(messageId) {
    try {
      const [rows] = await executeQuery(
        `SELECT m.*, u.name as sender_name 
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.id = ?`,
        [messageId]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async updateText(id, newText) {
    try {
      await executeQuery(
        'UPDATE messages SET text = ?, edited_at = CURRENT_TIMESTAMP, is_edited = 1 WHERE id = ?',
        [newText, id]
      );
      
      // Return updated message
      const [rows] = await executeQuery(
        `SELECT m.*, u.name as sender_name 
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.id = ?`,
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async softDelete(id) {
    try {
      await executeQuery(
        'UPDATE messages SET is_deleted = 1 WHERE id = ?',
        [id]
      );
      
      // Return updated message
      const [rows] = await executeQuery(
        `SELECT m.*, u.name as sender_name 
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.id = ?`,
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async getActiveMessagesByConversationId(conversationId) {
    try {
      const [rows] = await executeQuery(
        `SELECT m.*, u.name as sender_name 
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.conversation_id = ? AND m.is_deleted = 0
         ORDER BY m.created_at ASC`,
        [conversationId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async deleteById(id) {
    try {
      await executeQuery(
        'DELETE FROM messages WHERE id = ?',
        [id]
      );
    } catch (error) {
      throw error;
    }
  }
}

export default Message;
