import { executeQuery } from '../config/database.js';

class User {
  static #normalizeUser(row) {
    if (!row) return null;

    return {
      ...row,
      name: row.username
    };
  }

  static #normalizeUsers(rows) {
    return rows.map((row) => User.#normalizeUser(row));
  }

  static async create({ email, name, username, passwordHash, timezone = 'UTC' }) {
    try {
      const finalUsername = username ?? name;

      const [result] = await executeQuery(
        'INSERT INTO users (email, username, password_hash, timezone) VALUES (?, ?, ?, ?)',
        [email, finalUsername, passwordHash, timezone]
      );

      return this.findById(result.insertId);
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Пользователь с таким email или username уже существует');
      }
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Пользователь с таким email или username уже существует');
      }
      throw error;
    }
  }

  static async findById(id) {
    // First update the online status to ensure it's current
    await this.updateOnlineStatus(id);
    
    const [rows] = await executeQuery(
      "SELECT id, email, username, password_hash, avatar, last_seen_at, is_online, timezone, created_at, updated_at FROM users WHERE id = ?",
      [id]
    );

    const user = rows[0];
    if (!user) return null;
    
    // Calculate current online status based on last seen time
    const isOnline = user.is_online === 1 && user.last_seen_at !== null && 
      new Date(user.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);
    
    return {
      ...this.#normalizeUser(user),
      is_online: isOnline ? 1 : 0
    };
  }

  static async findByEmail(email) {
    const [rows] = await executeQuery(
      "SELECT id, email, username, password_hash, avatar, last_seen_at, is_online, timezone, created_at, updated_at FROM users WHERE email = ?",
      [email]
    );

    const user = rows[0];
    if (!user) return null;
    
    // Calculate current online status based on last seen time
    const isOnline = user.is_online === 1 && user.last_seen_at !== null && 
      new Date(user.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);
    
    return {
      ...this.#normalizeUser(user),
      is_online: isOnline ? 1 : 0
    };
  }

  static async findByUsername(username) {
    const [rows] = await executeQuery(
      "SELECT id, email, username, password_hash, avatar, last_seen_at, is_online, timezone, created_at, updated_at FROM users WHERE username = ?",
      [username]
    );

    const user = rows[0];
    if (!user) return null;
    
    // Calculate current online status based on last seen time
    const isOnline = user.is_online === 1 && user.last_seen_at !== null && 
      new Date(user.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);
    
    return {
      ...this.#normalizeUser(user),
      is_online: isOnline ? 1 : 0
    };
  }

  static async findByEmailOrUsername(emailOrUsername) {
    const [rows] = await executeQuery(
      "SELECT id, email, username, password_hash, avatar, last_seen_at, is_online, timezone, created_at, updated_at FROM users WHERE email = ? OR username = ?",
      [emailOrUsername, emailOrUsername]
    );

    const user = rows[0];
    if (!user) return null;
    
    // Calculate current online status based on last seen time
    const isOnline = user.is_online === 1 && user.last_seen_at !== null && 
      new Date(user.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);
    
    return {
      ...this.#normalizeUser(user),
      is_online: isOnline ? 1 : 0
    };
  }

  static async getAll() {
    const [rows] = await executeQuery(
      "SELECT id, email, username, avatar, last_seen_at, is_online, timezone, created_at, updated_at FROM users ORDER BY created_at DESC"
    );

    // Calculate current online status for each user
    return this.#normalizeUsers(rows).map(user => ({
      ...user,
      is_online: user.is_online === 1 && user.last_seen_at !== null && 
        new Date(user.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000) ? 1 : 0
    }));
  }

  static async updateProfile(id, { name, username, avatar, timezone }) {
    const updateFields = [];
    const values = [];

    const finalUsername = username ?? name;

    if (finalUsername !== undefined) {
      updateFields.push('username = ?');
      values.push(finalUsername);
    }

    if (avatar !== undefined) {
      updateFields.push('avatar = ?');
      values.push(avatar);
    }

    if (timezone !== undefined) {
      updateFields.push('timezone = ?');
      values.push(timezone);
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
  }

  static async updateLastSeen(id) {
    await executeQuery(
      'UPDATE users SET last_seen_at = CURRENT_TIMESTAMP, is_online = 1 WHERE id = ?',
      [id]
    );

    return this.findById(id);
  }

  static async setOffline(id) {
    await executeQuery(
      'UPDATE users SET last_seen_at = CURRENT_TIMESTAMP, is_online = 0 WHERE id = ?',
      [id]
    );

    return this.findById(id);
  }

  static async updateOnlineStatus(id) {
    // Update online status based on last seen time (within 5 minutes)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    await executeQuery(
      "UPDATE users SET is_online = CASE WHEN is_online = 1 AND last_seen_at IS NOT NULL AND datetime(last_seen_at, 'unixepoch') > ? THEN 1 ELSE 0 END WHERE id = ?",
      [fiveMinutesAgo.getTime() / 1000, id]
    );

    return this.findById(id);
  }

  static async getOnlineUsers() {
    const [rows] = await executeQuery(
      "SELECT id, email, username, avatar, last_seen_at, is_online, timezone, created_at, updated_at FROM users WHERE is_online = 1 AND last_seen_at IS NOT NULL ORDER BY username ASC"
    );

    // Filter users who are actually online based on last seen time
    return this.#normalizeUsers(rows).filter(user => 
      user.last_seen_at !== null && 
      new Date(user.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000)
    );
  }
}

export default User;
