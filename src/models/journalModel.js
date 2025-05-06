const db = require('../config/db');

const createEntry = async (entryData) => {
  const { user_id, entry_text, mood_rating, timestamp } = entryData;
  
  const query = `
    INSERT INTO journal_entries (user_id, entry_text, mood_rating, timestamp)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  
  const values = [user_id, entry_text, mood_rating, timestamp];
  
  try {
    const result = await db.query(query, values);
    return result.rows[0].id;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const getUserEntries = async (userId) => {
  const query = `
    SELECT id, user_id, entry_text, mood_rating, timestamp
    FROM journal_entries
    WHERE user_id = $1
    ORDER BY timestamp DESC
  `;
  
  try {
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const getEntryById = async (entryId) => {
  const query = `
    SELECT id, user_id, entry_text, mood_rating, timestamp
    FROM journal_entries
    WHERE id = $1
  `;
  
  try {
    const result = await db.query(query, [entryId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const updateEntry = async (entryId, entryData) => {
  const { entry_text, mood_rating } = entryData;
  
  const query = `
    UPDATE journal_entries
    SET entry_text = $1, mood_rating = $2
    WHERE id = $3
    RETURNING id, user_id, entry_text, mood_rating, timestamp
  `;
  
  const values = [entry_text, mood_rating, entryId];
  
  try {
    const result = await db.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const deleteEntry = async (entryId) => {
  const query = `
    DELETE FROM journal_entries
    WHERE id = $1
    RETURNING id
  `;
  
  try {
    const result = await db.query(query, [entryId]);
    return result.rows[0] ? true : false;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

module.exports = {
  createEntry,
  getUserEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
};