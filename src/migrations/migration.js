const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const MIGRATIONS_TABLE = 'migrations';

async function initMigrationsTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await db.query(query);
    console.log('Migrations table initialized');
  } catch (error) {
    console.error('Error initializing migrations table:', error);
    throw error;
  }
}

async function getAppliedMigrations() {
  try {
    const query = `
      SELECT name FROM ${MIGRATIONS_TABLE}
      ORDER BY applied_at ASC;
    `;
    const result = await db.query(query);
    return result.rows.map(row => row.name);
  } catch (error) {
    console.error('Error getting applied migrations:', error);
    throw error;
  }
}

async function getMigrationFiles() {
  try {
    const files = await readdir(path.join(__dirname));
    return files
      .filter(file => file.endsWith('.sql') && file.startsWith('migration_'))
      .sort();
  } catch (error) {
    console.error('Error getting migration files:', error);
    throw error;
  }
}

async function applyMigration(migrationFile) {
  try {
    const filePath = path.join(__dirname, migrationFile);
    const sql = await readFile(filePath, 'utf8');
    
    await db.query('BEGIN');
    
    console.log(`Applying migration: ${migrationFile}`);
    await db.query(sql);
    
    const insertQuery = `
      INSERT INTO ${MIGRATIONS_TABLE} (name)
      VALUES ($1);
    `;
    await db.query(insertQuery, [migrationFile]);
    
    await db.query('COMMIT');
    
    console.log(`Successfully applied migration: ${migrationFile}`);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(`Error applying migration ${migrationFile}:`, error);
    throw error;
  }
}

async function runMigrations() {
  try {
    await initMigrationsTable();
    
    const appliedMigrations = await getAppliedMigrations();
    const migrationFiles = await getMigrationFiles();
    
    const pendingMigrations = migrationFiles.filter(
      file => !appliedMigrations.includes(file)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to apply');
      return;
    }
    
    console.log(`Found ${pendingMigrations.length} pending migrations`);
    
    for (const migration of pendingMigrations) {
      await applyMigration(migration);
    }
    
    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
  }
}

async function createMigration(name) {
  try {
    if (!name) {
      throw new Error('Migration name is required');
    }
    
    const sanitizedName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    const timestamp = new Date().toISOString().replace(/[-:\.T]/g, '').slice(0, 14);
    
    const fileName = `migration_${timestamp}_${sanitizedName}.sql`;
    
    const content = `-- Migration: ${name}
-- Created at: ${new Date().toISOString()}

-- Write your migration SQL here
-- For example:
-- ALTER TABLE table_name ADD COLUMN new_column VARCHAR(255);
`;
    
    const filePath = path.join(__dirname, fileName);
    await writeFile(filePath, content);
    
    console.log(`Migration file created: ${fileName}`);
  } catch (error) {
    console.error('Error creating migration:', error);
    process.exit(1);
  }
}

async function rollbackLastMigration() {
  try {
    await initMigrationsTable();
    
    const query = `
      SELECT name FROM ${MIGRATIONS_TABLE}
      ORDER BY applied_at DESC
      LIMIT 1;
    `;
    const result = await db.query(query);
    
    if (result.rows.length === 0) {
      console.log('No migrations to rollback');
      return;
    }
    
    const lastMigration = result.rows[0].name;
    console.log(`Rolling back migration: ${lastMigration}`);
    
    const filePath = path.join(__dirname, lastMigration);
    const sql = await readFile(filePath, 'utf8');
    
    const rollbackMatch = sql.match(/-- ROLLBACK:([\s\S]*?)(?:$|-- END ROLLBACK)/);
    if (!rollbackMatch) {
      throw new Error(`No rollback script found in migration: ${lastMigration}`);
    }
    
    const rollbackSql = rollbackMatch[1].trim();
    
    await db.query('BEGIN');
    
    await db.query(rollbackSql);
    
    const deleteQuery = `
      DELETE FROM ${MIGRATIONS_TABLE}
      WHERE name = $1;
    `;
    await db.query(deleteQuery, [lastMigration]);
    
    await db.query('COMMIT');
    
    console.log(`Successfully rolled back migration: ${lastMigration}`);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error rolling back migration:', error);
    process.exit(1);
  } finally {
  }
}

const command = process.argv[2];
const migrationName = process.argv[3];

if (command === 'up' || command === 'migrate') {
  runMigrations().catch(console.error);
} else if (command === 'create') {
  createMigration(migrationName).catch(console.error);
} else if (command === 'down' || command === 'rollback') {
  rollbackLastMigration().catch(console.error);
} else {
  console.log('Usage:');
  console.log('  node migration.js up              - Run all pending migrations');
  console.log('  node migration.js create <name>   - Create a new migration file');
  console.log('  node migration.js down            - Rollback the last migration');
  process.exit(1);
}

module.exports = {
  initMigrationsTable,
  getAppliedMigrations,
  getMigrationFiles,
  applyMigration,
  runMigrations,
  createMigration,
  rollbackLastMigration,
};