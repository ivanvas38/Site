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
        username TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT DEFAULT NULL,
        last_seen_at DATETIME DEFAULT NULL,
        is_online BOOLEAN DEFAULT 0,
        timezone TEXT DEFAULT 'UTC',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createConversationsTable = `
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1_id INTEGER NOT NULL,
        user2_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user1_id) REFERENCES users(id),
        FOREIGN KEY(user2_id) REFERENCES users(id)
      )
    `;

    const createMessagesTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        delivered_at DATETIME DEFAULT NULL,
        read_at DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(conversation_id) REFERENCES conversations(id),
        FOREIGN KEY(sender_id) REFERENCES users(id)
      )
    `;

    // Create users table
    await new Promise((resolve, reject) => {
      db.run(createUsersTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('Таблица users создана или уже существует');

    // Ensure users.username exists (migration from legacy users.name)
    const usersColumns = await new Promise((resolve, reject) => {
      db.all('PRAGMA table_info(users)', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const hasUsername = usersColumns.some((col) => col.name === 'username');
    const hasName = usersColumns.some((col) => col.name === 'name');

    if (!hasUsername) {
      await new Promise((resolve, reject) => {
        db.run('ALTER TABLE users ADD COLUMN username TEXT', (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      if (hasName) {
        await new Promise((resolve, reject) => {
          db.run(
            "UPDATE users SET username = name WHERE username IS NULL OR username = ''",
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }

      console.log('Колонка username добавлена/обновлена в таблице users');
    }

    // Create conversations table
    await new Promise((resolve, reject) => {
      db.run(createConversationsTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('Таблица conversations создана или уже существует');

    // Create messages table
    await new Promise((resolve, reject) => {
      db.run(createMessagesTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('Таблица messages создана или уже существует');

    // Add missing columns to existing messages table
    await new Promise((resolve, reject) => {
      db.run(`ALTER TABLE messages ADD COLUMN delivered_at DATETIME DEFAULT NULL`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    await new Promise((resolve, reject) => {
      db.run(`ALTER TABLE messages ADD COLUMN read_at DATETIME DEFAULT NULL`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    console.log('Колонки delivered_at и read_at добавлены в таблицу messages');

    // Add avatar column to users table
    await new Promise((resolve, reject) => {
      db.run(`ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT NULL`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    console.log('Колонка avatar добавлена в таблицу users');

    // Add last_seen_at column to users table
    await new Promise((resolve, reject) => {
      db.run(`ALTER TABLE users ADD COLUMN last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    console.log('Колонка last_seen_at добавлена в таблицу users');

    // Add is_online column to users table
    await new Promise((resolve, reject) => {
      db.run(`ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    console.log('Колонка is_online добавлена в таблицу users');

    // Add timezone column to users table
    await new Promise((resolve, reject) => {
      db.run(`ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC'`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    console.log('Колонка timezone добавлена в таблицу users');

    // Create unique constraint index for conversations
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_users 
        ON conversations(user1_id, user2_id)
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('Индекс для conversations создан или уже существует');
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