const db = require('../config/db');
const bcrypt = require('bcrypt');

const createUser = async (userData) => {
  const { username, email, password } = userData;
  
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  const query = `
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, username, email, created_at
  `;
  
  const values = [username, email, hashedPassword];
  
  try {
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      if (error.constraint.includes('username')) {
        throw new Error('Username already exists');
      } else if (error.constraint.includes('email')) {
        throw new Error('Email already exists');
      }
    }
    console.error('Database error:', error);
    throw error;
  }
};

const getUserByUsername = async (username) => {
  const query = `
    SELECT id, username, email, password, created_at
    FROM users
    WHERE username = $1
  `;
  
  try {
    const result = await db.query(query, [username]);
    return result.rows[0];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const getUserByEmail = async (email) => {
  const query = `
    SELECT id, username, email, password, created_at
    FROM users
    WHERE email = $1
  `;
  
  try {
    const result = await db.query(query, [email]);
    return result.rows[0];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const getUserById = async (id) => {
  const query = `
    SELECT id, username, email, created_at
    FROM users
    WHERE id = $1
  `;
  
  try {
    const result = await db.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  createUser,
  getUserByUsername,
  getUserByEmail,
  getUserById,
  verifyPassword,
};