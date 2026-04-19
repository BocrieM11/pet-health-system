const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建数据库连接
const dbPath = path.join(__dirname, 'pet_health.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
  } else {
    console.log('✅ 数据库连接成功');
    initDatabase();
  }
});

// 初始化数据库表
function initDatabase() {
  // 用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 宠物信息表
  db.run(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      breed TEXT,
      gender TEXT,
      birth_date TEXT,
      weight REAL,
      avatar TEXT,
      owner_name TEXT,
      owner_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 检查并添加 user_id 和 avatar 字段（兼容旧数据库）
  db.all("PRAGMA table_info(pets)", [], (err, columns) => {
    if (!err && columns) {
      const hasUserId = columns.some(col => col.name === 'user_id');
      const hasAvatar = columns.some(col => col.name === 'avatar');

      if (!hasUserId) {
        db.run("ALTER TABLE pets ADD COLUMN user_id INTEGER", (err) => {
          if (!err) console.log('✅ 添加 user_id 字段');
        });
      }

      if (!hasAvatar) {
        db.run("ALTER TABLE pets ADD COLUMN avatar TEXT", (err) => {
          if (!err) console.log('✅ 添加 avatar 字段');
        });
      }
    }
  });

  // 健康记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      record_type TEXT NOT NULL,
      record_date TEXT NOT NULL,
      description TEXT,
      weight REAL,
      temperature REAL,
      heart_rate INTEGER,
      respiratory_rate INTEGER,
      blood_pressure_high INTEGER,
      blood_pressure_low INTEGER,
      blood_glucose REAL,
      activity_level TEXT,
      appetite TEXT,
      mental_state TEXT,
      symptoms TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pet_id) REFERENCES pets(id)
    )
  `);

  // 检查并添加新的健康指标字段（兼容旧数据库）
  db.all("PRAGMA table_info(health_records)", [], (err, columns) => {
    if (!err && columns) {
      const fieldChecks = [
        { name: 'heart_rate', type: 'INTEGER' },
        { name: 'respiratory_rate', type: 'INTEGER' },
        { name: 'blood_pressure_high', type: 'INTEGER' },
        { name: 'blood_pressure_low', type: 'INTEGER' },
        { name: 'blood_glucose', type: 'REAL' },
        { name: 'activity_level', type: 'TEXT' },
        { name: 'appetite', type: 'TEXT' },
        { name: 'mental_state', type: 'TEXT' },
        { name: 'symptoms', type: 'TEXT' }
      ];

      fieldChecks.forEach(field => {
        const hasField = columns.some(col => col.name === field.name);
        if (!hasField) {
          db.run(`ALTER TABLE health_records ADD COLUMN ${field.name} ${field.type}`, (err) => {
            if (!err) console.log(`✅ 添加 ${field.name} 字段`);
          });
        }
      });
    }
  });

  // 疫苗接种记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS vaccinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      vaccine_name TEXT NOT NULL,
      vaccination_date TEXT NOT NULL,
      next_due_date TEXT,
      veterinarian TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pet_id) REFERENCES pets(id)
    )
  `);

  // 提醒表
  db.run(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      pet_id INTEGER,
      reminder_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      scheduled_time DATETIME NOT NULL,
      status TEXT DEFAULT 'pending',
      notification_methods TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (pet_id) REFERENCES pets(id)
    )
  `);

  // 用药记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      medication_name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pet_id) REFERENCES pets(id)
    )
  `);

  // 创建性能优化索引
  db.run('CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_health_records_pet_id ON health_records(pet_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(record_date)');
  db.run('CREATE INDEX IF NOT EXISTS idx_health_pet_date ON health_records(pet_id, record_date DESC)');
  db.run('CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_id ON vaccinations(pet_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(scheduled_time, status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_medications_pet_id ON medications(pet_id)');

  console.log('✅ 数据库表和索引初始化完成');
}

module.exports = db;
