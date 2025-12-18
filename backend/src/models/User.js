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
    const [rows] = await executeQuery(
      'SELECT id, email, username, password_hash, avatar, last_seen_at, is_online, timezone, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    return this.#normalizeUser(rows[0]);
  }

  static async findByEmail(email) {
    const [rows] = await executeQuery(
      'SELECT id, email, username, password_hash, avatar, last_seen_at, is_online, timezone, created_at, updated_at FROM users WHERE email = ?',
      [email]
    );

    return this.#normalizeUser(rows[0]);
  }

  static async findByUsername(username) {
    const [rows] = await executeQuery(
      'SELECT id, email, username, password_hash, avatar, last_seen_at, is_online, timezone, created_at, updated_at FROM users WHERE username = ?',
      [username]
    );

    return this.#normalizeUser(rows[0]);
  }

  static async findByEmailOrUsername(emailOrUsername) {
    const [rows] = await executeQuery(
      'SELECT id, email, username, password_hash, avatar, last_seen_at, is_online, timezone, created_at, updated_at FROM users WHERE email = ? OR username = ?',
      [emailOrUsername, emailOrUsername]
    );

    return this.#normalizeUser(rows[0]);
  }

  static async getAll() {
    const [rows] = await executeQuery(
      'SELECT id, email, username, avatar, last_seen_at, is_online, timezone, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    return this.#normalizeUsers(rows);
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
    await executeQuery('UPDATE users SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    return this.updateOnlineStatus(id);
  }

  static async updateOnlineStatus(id) {
    await executeQuery(
      "UPDATE users SET is_online = (last_seen_at > datetime('now', '-5 minutes')) WHERE id = ?",
      [id]
    );

    return this.findById(id);
  }

  static async getOnlineUsers() {
    const [rows] = await executeQuery(
      'SELECT id, email, username, avatar, last_seen_at, is_online, timezone, created_at, updated_at FROM users WHERE is_online = 1 ORDER BY username ASC'
    );

    return this.#normalizeUsers(rows);
  }
}

export default User;
