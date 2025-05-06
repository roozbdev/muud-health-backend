const db = require('../config/db');

const addContact = async (contactData) => {
  const { user_id, contact_name, contact_email } = contactData;
  
  const query = `
    INSERT INTO contacts (user_id, contact_name, contact_email)
    VALUES ($1, $2, $3)
    RETURNING id
  `;
  
  const values = [user_id, contact_name, contact_email];
  
  try {
    const result = await db.query(query, values);
    return result.rows[0].id;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const getUserContacts = async (userId) => {
  const query = `
    SELECT id, user_id, contact_name, contact_email
    FROM contacts
    WHERE user_id = $1
  `;
  
  try {
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const getContactById = async (contactId) => {
  const query = `
    SELECT id, user_id, contact_name, contact_email
    FROM contacts
    WHERE id = $1
  `;
  
  try {
    const result = await db.query(query, [contactId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const updateContact = async (contactId, contactData) => {
  const { contact_name, contact_email } = contactData;
  
  const query = `
    UPDATE contacts
    SET contact_name = $1, contact_email = $2
    WHERE id = $3
    RETURNING id, user_id, contact_name, contact_email
  `;
  
  const values = [contact_name, contact_email, contactId];
  
  try {
    const result = await db.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const deleteContact = async (contactId) => {
  const query = `
    DELETE FROM contacts
    WHERE id = $1
    RETURNING id
  `;
  
  try {
    const result = await db.query(query, [contactId]);
    return result.rows[0] ? true : false;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

module.exports = {
  addContact,
  getUserContacts,
  getContactById,
  updateContact,
  deleteContact,
};