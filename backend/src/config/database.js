import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../../data');
const dbPath = join(dataDir, 'backend.db');

// Create data directory if it doesn't exist
try {
  mkdirSync(dataDir, { recursive: true });
  console.log(`Data directory ensured at: ${dataDir}`);
} catch (error) {
  console.error('Error creating data directory:', error.message);
}

let db;

try {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Ошибка подключения к SQLite:', err.message);
    } else {
      console.log(`Подключен к SQLite: ${dbPath}`);
    }
  });
} catch (error) {
  console.error('Ошибка создания SQLite:', error.message);
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

    await new Promise((resolve, reject) => {
      db.run(createUsersTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('Таблица users создана или уже существует');
  } catch (error) {
    console.error('Ошибка при создании таблиц:', error.message);
  }
};

const executeQuery = async (query, params = []) => {
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
};

export {
  db,
  executeQuery,
  createTables
};