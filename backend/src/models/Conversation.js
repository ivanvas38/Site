import { executeQuery } from '../config/database.js';

class Conversation {
  static async create(user1Id, user2Id) {
    try {
      // Ensure user1Id is always the smaller one for consistency
      const [smallerId, largerId] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];
      
      const [result] = await executeQuery(
        'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
        [smallerId, largerId]
      );
      
      return this.findById(result.insertId);
    } catch (error) {
      // If conversation already exists, find and return it
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        return this.findByUsers(user1Id, user2Id);
      }
      throw error;
    }
  }

  static async findByUsers(user1Id, user2Id) {
    try {
      const [rows] = await executeQuery(
        `SELECT * FROM conversations 
         WHERE (user1_id = ? AND user2_id = ?) 
            OR (user1_id = ? AND user2_id = ?)`,
        [user1Id, user2Id, user2Id, user1Id]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await executeQuery(
        'SELECT * FROM conversations WHERE id = ?',
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const [rows] = await executeQuery(
        `SELECT * FROM conversations 
         WHERE user1_id = ? OR user2_id = ? 
         ORDER BY updated_at DESC`,
        [userId, userId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getLastMessage(conversationId) {
    try {
      const [rows] = await executeQuery(
        `SELECT m.*, u.username as sender_username 
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.conversation_id = ?
         ORDER BY m.created_at DESC
         LIMIT 1`,
        [conversationId]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async updateTimestamp(conversationId) {
    try {
      await executeQuery(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [conversationId]
      );
    } catch (error) {
      throw error;
    }
  }
}

export default Conversation;
