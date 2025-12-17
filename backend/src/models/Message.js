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
        `SELECT m.*, u.username as sender_username 
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
        `SELECT m.*, u.username as sender_username 
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
