const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'backend_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

const useSQLite = process.env.USE_SQLITE === 'true' || process.env.NODE_ENV === 'development';

let pool;
let db;

if (useSQLite) {
  console.log('Используется SQLite для разработки');
  db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
      console.error('Ошибка подключения к SQLite:', err.message);
    } else {
      console.log('Подключен к SQLite в памяти');
    }
  });
} else {
  pool = mysql.createPool(dbConfig);
  console.log('Используется MySQL');
}

const createTables = async () => {
  try {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    if (useSQLite) {
      await new Promise((resolve, reject) => {
        db.run(createUsersTable, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      const connection = await pool.getConnection();
      await connection.execute(createUsersTable);
      connection.release();
    }
    console.log('Таблица users создана или уже существует');
  } catch (error) {
    console.error('Ошибка при создании таблиц:', error.message);
  }
};

const executeQuery = async (query, params = []) => {
  if (useSQLite) {
    return new Promise((resolve, reject) => {
      if (query.trim().toUpperCase().startsWith('SELECT')) {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve([rows]);
        });
      } else {
        db.run(query, params, function(err) {
          if (err) reject(err);
          else resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
        });
      }
    });
  } else {
    return await pool.execute(query, params);
  }
};

module.exports = {
  pool: useSQLite ? null : pool,
  db: useSQLite ? db : null,
  executeQuery,
  createTables,
  useSQLite
};
