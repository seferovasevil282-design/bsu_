const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'database.db');
    
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database bağlantı xətası:', err);
      } else {
        console.log('✅ Database bağlantısı uğurlu');
        console.log(`📁 Database path: ${dbPath}`);
        this.initializeTables();
      }
    });
  }

  initializeTables() {
    this.db.serialize(() => {
      // İstifadəçilər cədvəli
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          phone TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          fullname TEXT NOT NULL,
          faculty TEXT NOT NULL,
          degree TEXT NOT NULL,
          course INTEGER NOT NULL,
          profile_picture TEXT DEFAULT NULL,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Adminlər cədvəli
      this.db.run(`
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          is_super_admin INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Mesajlar cədvəli (qrup chatları)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          faculty TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Şəxsi mesajlar cədvəli
      this.db.run(`
        CREATE TABLE IF NOT EXISTS private_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sender_id INTEGER NOT NULL,
          receiver_id INTEGER NOT NULL,
          message TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sender_id) REFERENCES users(id),
          FOREIGN KEY (receiver_id) REFERENCES users(id)
        )
      `);

      // Əngəllənmiş istifadəçilər
      this.db.run(`
        CREATE TABLE IF NOT EXISTS blocked_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          blocked_user_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (blocked_user_id) REFERENCES users(id),
          UNIQUE(user_id, blocked_user_id)
        )
      `);

      // Şikayətlər cədvəli
      this.db.run(`
        CREATE TABLE IF NOT EXISTS reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reporter_id INTEGER NOT NULL,
          reported_user_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reporter_id) REFERENCES users(id),
          FOREIGN KEY (reported_user_id) REFERENCES users(id)
        )
      `);

      // Filtr sözləri
      this.db.run(`
        CREATE TABLE IF NOT EXISTS filter_words (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          word TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Qaydalar
      this.db.run(`
        CREATE TABLE IF NOT EXISTS rules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Günün mövzusu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS daily_topic (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          topic TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Mesaj silinmə konfiqurasiyası
      this.db.run(`
        CREATE TABLE IF NOT EXISTS message_config (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          group_message_hours INTEGER DEFAULT 24,
          private_message_hours INTEGER DEFAULT 24,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Super admin yaratma
      const superAdminPassword = bcrypt.hashSync('ursa618', 10);
      this.db.run(`
        INSERT OR IGNORE INTO admins (username, password, is_super_admin) 
        VALUES (?, ?, 1)
      `, ['ursamajor', superAdminPassword]);

      // Əsas qaydaları əlavə et
      this.db.run(`
        INSERT OR IGNORE INTO rules (id, content) 
        VALUES (1, 'BSU Chat Qaydaları:\n\n1. Hörmətli olmaq\n2. Spam göndərməmək\n3. Şəxsi məlumatları paylaşmamaq')
      `);

      // Əsas günün mövzusunu əlavə et
      this.db.run(`
        INSERT OR IGNORE INTO daily_topic (id, topic) 
        VALUES (1, 'Salamlar! BSU Chat-ə xoş gəlmisiniz.')
      `);

      // Əsas mesaj konfiqurasiyasını əlavə et
      this.db.run(`
        INSERT OR IGNORE INTO message_config (id) VALUES (1)
      `);

      console.log('✅ Bütün cədvəllər yaradıldı');
    });
  }

  // Utility metodları
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = new Database();
