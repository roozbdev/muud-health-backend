const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    const sqlFilePath = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    await pool.query(sql);
    
    console.log('Database initialized successfully');
    pool.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };