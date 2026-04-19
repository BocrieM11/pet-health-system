const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;
let isPostgres = false;

// 根据环境变量选择数据库
if (process.env.DATABASE_URL) {
  // 生产环境：使用PostgreSQL
  console.log('✅ 使用PostgreSQL数据库');
  isPostgres = true;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });

  // 封装统一的数据库接口
  // 转换SQLite风格的?占位符为PostgreSQL风格的$1, $2...
  const convertPlaceholders = (sql) => {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
  };

  db = {
    all: async (sql, params = []) => {
      const pgSql = convertPlaceholders(sql);
      const result = await pool.query(pgSql, params);
      return result.rows;
    },
    get: async (sql, params = []) => {
      const pgSql = convertPlaceholders(sql);
      const result = await pool.query(pgSql, params);
      return result.rows[0];
    },
    run: async (sql, params = []) => {
      const pgSql = convertPlaceholders(sql);
      const result = await pool.query(pgSql, params);
      return {
        lastID: result.rows[0]?.id,
        changes: result.rowCount
      };
    }
  };

  // 初始化PostgreSQL表结构
  initPostgresDatabase(pool);

} else {
  // 开发环境：使用SQLite
  console.log('✅ 使用SQLite数据库');

  const dbPath = path.join(__dirname, 'pet_health.db');
  const sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ 数据库连接失败:', err.message);
    } else {
      console.log('✅ 数据库连接成功');
      initSQLiteDatabase(sqliteDb);
    }
  });

  // 封装Promise接口
  db = {
    all: (sql, params = []) => new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }),
    get: (sql, params = []) => new Promise((resolve, reject) => {
      sqliteDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    }),
    run: (sql, params = []) => new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    })
  };
}

async function initPostgresDatabase(pool) {
  try {
    // 用户表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 宠物表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        species VARCHAR(100) NOT NULL,
        breed VARCHAR(100),
        gender VARCHAR(20),
        birth_date DATE,
        weight DECIMAL(10,2),
        avatar TEXT,
        owner_name VARCHAR(255),
        owner_phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 健康记录表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS health_records (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER REFERENCES pets(id),
        record_type VARCHAR(100) NOT NULL,
        record_date DATE NOT NULL,
        description TEXT,
        weight DECIMAL(10,2),
        temperature DECIMAL(5,2),
        heart_rate INTEGER,
        respiratory_rate INTEGER,
        blood_pressure_high INTEGER,
        blood_pressure_low INTEGER,
        blood_glucose DECIMAL(5,2),
        activity_level VARCHAR(50),
        appetite VARCHAR(50),
        mental_state VARCHAR(50),
        symptoms TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 疫苗记录表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vaccinations (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER REFERENCES pets(id),
        vaccine_name VARCHAR(255) NOT NULL,
        vaccination_date DATE NOT NULL,
        next_due_date DATE,
        veterinarian VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 提醒表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        pet_id INTEGER REFERENCES pets(id),
        reminder_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        scheduled_time TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        notification_methods TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 用药记录表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medications (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER REFERENCES pets(id),
        medication_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100),
        frequency VARCHAR(100),
        start_date DATE NOT NULL,
        end_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建索引（使用DO语句避免IF NOT EXISTS的兼容性问题）
    const createIndexSafely = async (indexName, tableName, column) => {
      try {
        await pool.query(`CREATE INDEX ${indexName} ON ${tableName}(${column})`);
      } catch (err) {
        // 索引已存在，忽略错误
        if (err.code !== '42P07') { // 42P07 = duplicate_table (索引已存在)
          console.error(`创建索引 ${indexName} 失败:`, err.message);
        }
      }
    };

    await createIndexSafely('idx_pets_user_id', 'pets', 'user_id');
    await createIndexSafely('idx_health_records_pet_id', 'health_records', 'pet_id');
    await createIndexSafely('idx_vaccinations_pet_id', 'vaccinations', 'pet_id');
    await createIndexSafely('idx_reminders_user_id', 'reminders', 'user_id');
    await createIndexSafely('idx_medications_pet_id', 'medications', 'pet_id');

    console.log('✅ PostgreSQL数据库表和索引初始化完成');
  } catch (error) {
    console.error('❌ PostgreSQL初始化失败:', error);
  }
}

function initSQLiteDatabase(db) {
  // 原有的SQLite初始化代码
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

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

  // 创建索引
  db.run('CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_health_records_pet_id ON health_records(pet_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(record_date)');
  db.run('CREATE INDEX IF NOT EXISTS idx_health_pet_date ON health_records(pet_id, record_date DESC)');
  db.run('CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_id ON vaccinations(pet_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(scheduled_time, status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_medications_pet_id ON medications(pet_id)');

  console.log('✅ SQLite数据库表和索引初始化完成');
}

module.exports = db;
