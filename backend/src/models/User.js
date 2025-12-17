import { executeQuery } from '../config/database.js';

class User {
  static async create({ email, name, passwordHash }) {
    try {
      const [result] = await executeQuery(
        'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)',
        [email, name, passwordHash]
      );
      
      return this.findById(result.insertId);
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Пользователь с таким email или name уже существует');
      }
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Пользователь с таким email или name уже существует');
      }
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await executeQuery(
        'SELECT id, email, name, password_hash, avatar, last_seen_at, is_online, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await executeQuery(
        'SELECT id, email, name, password_hash, avatar, last_seen_at, is_online, created_at, updated_at FROM users WHERE email = ?',
        [email]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const [rows] = await executeQuery(
        'SELECT id, email, name, password_hash, avatar, last_seen_at, is_online, created_at, updated_at FROM users WHERE name = ?',
        [username]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByEmailOrUsername(emailOrUsername) {
    try {
      const [rows] = await executeQuery(
        'SELECT id, email, name, password_hash, avatar, last_seen_at, is_online, created_at, updated_at FROM users WHERE email = ? OR name = ?',
        [emailOrUsername, emailOrUsername]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async getAll() {
    try {
      const [rows] = await executeQuery(
        'SELECT id, email, name, avatar, last_seen_at, is_online, created_at, updated_at FROM users ORDER BY created_at DESC'
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(id, { name, avatar }) {
    try {
      const updateFields = [];
      const values = [];

      if (name !== undefined) {
        updateFields.push('name = ?');
        values.push(name);
      }

      if (avatar !== undefined) {
        updateFields.push('avatar = ?');
        values.push(avatar);
      }

      if (updateFields.length === 0) {
        throw new Error('Нет данных для обновления');
      }

      values.push(id);

      await executeQuery(
        `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async updateLastSeen(id) {
    try {
      await executeQuery(
        'UPDATE users SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      return this.updateOnlineStatus(id);
    } catch (error) {
      throw error;
    }
  }

  static async updateOnlineStatus(id) {
    try {
      await executeQuery(
        'UPDATE users SET is_online = (last_seen_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)) WHERE id = ?',
        [id]
      );

      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async getOnlineUsers() {
    try {
      const [rows] = await executeQuery(
        'SELECT id, email, name, avatar, last_seen_at, is_online, created_at, updated_at FROM users WHERE is_online = 1 ORDER BY name ASC'
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

export default User;
