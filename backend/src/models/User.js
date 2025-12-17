const { executeQuery } = require('../config/database');

class User {
  static async create({ email, username, passwordHash }) {
    try {
      const [result] = await executeQuery(
        'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)',
        [email, username, passwordHash]
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
    try {
      const [rows] = await executeQuery(
        'SELECT id, email, username, password_hash, created_at, updated_at FROM users WHERE id = ?',
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
        'SELECT id, email, username, password_hash, created_at, updated_at FROM users WHERE email = ?',
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
        'SELECT id, email, username, password_hash, created_at, updated_at FROM users WHERE username = ?',
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
        'SELECT id, email, username, password_hash, created_at, updated_at FROM users WHERE email = ? OR username = ?',
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
        'SELECT id, email, username, created_at, updated_at FROM users ORDER BY created_at DESC'
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
