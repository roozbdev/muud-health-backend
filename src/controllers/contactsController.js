const contactsModel = require('../models/contactsModel');


const addContact = async (req, res) => {
  try {
    const contactId = await contactsModel.addContact(req.body);
    
    res.status(201).json({ success: true, contact_id: contactId });
  } catch (err) {
    console.error('Error adding contact:', err);
    res.status(500).json({ success: false, message: 'Failed to add contact' });
  }
};

const getUserContacts = async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const contacts = await contactsModel.getUserContacts(userId);
    
    res.status(200).json({ contacts });
  } catch (err) {
    console.error('Error retrieving contacts:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve contacts' });
  }
};

const getContactById = async (req, res) => {
  try {
    const contactId = req.params.id;
    
    if (!contactId) {
      return res.status(400).json({ success: false, message: 'Contact ID is required' });
    }

    const contact = await contactsModel.getContactById(contactId);
    
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    if (String(contact.user_id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this contact' });
    }
    
    res.status(200).json({ success: true, contact });
  } catch (err) {
    console.error('Error retrieving contact:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve contact' });
  }
};

const updateContact = async (req, res) => {
  try {
    const contactId = req.params.id;
    
    if (!contactId) {
      return res.status(400).json({ success: false, message: 'Contact ID is required' });
    }

    const existingContact = await contactsModel.getContactById(contactId);
    
    if (!existingContact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    if (String(existingContact.user_id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this contact' });
    }

    const updatedContact = await contactsModel.updateContact(contactId, req.body);
    
    if (!updatedContact) {
      return res.status(404).json({ success: false, message: 'Failed to update contact' });
    }
    
    res.status(200).json({ success: true, contact: updatedContact });
  } catch (err) {
    console.error('Error updating contact:', err);
    res.status(500).json({ success: false, message: 'Failed to update contact' });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contactId = req.params.id;
    
    if (!contactId) {
      return res.status(400).json({ success: false, message: 'Contact ID is required' });
    }

    const existingContact = await contactsModel.getContactById(contactId);
    
    if (!existingContact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    if (String(existingContact.user_id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this contact' });
    }

    const result = await contactsModel.deleteContact(contactId);
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Failed to delete contact' });
    }
    
    res.status(200).json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(500).json({ success: false, message: 'Failed to delete contact' });
  }
};

module.exports = {
  addContact,
  getUserContacts,
  getContactById,
  updateContact,
  deleteContact,
};