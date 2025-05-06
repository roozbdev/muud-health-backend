const journalModel = require('../models/journalModel');


const createEntry = async (req, res) => {
  try {
    const entryId = await journalModel.createEntry(req.body);
    
    res.status(201).json({ success: true, entry_id: entryId });
  } catch (err) {
    console.error('Error creating journal entry:', err);
    res.status(500).json({ success: false, message: 'Failed to create journal entry' });
  }
};

const getUserEntries = async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const entries = await journalModel.getUserEntries(userId);
    
    res.status(200).json({ entries });
  } catch (err) {
    console.error('Error retrieving journal entries:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve journal entries' });
  }
};

const getEntryById = async (req, res) => {
  try {
    const entryId = req.params.id;
    
    if (!entryId) {
      return res.status(400).json({ success: false, message: 'Entry ID is required' });
    }

    const entry = await journalModel.getEntryById(entryId);
    
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    if (String(entry.user_id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this entry' });
    }
    
    res.status(200).json({ success: true, entry });
  } catch (err) {
    console.error('Error retrieving journal entry:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve journal entry' });
  }
};

const updateEntry = async (req, res) => {
  try {
    const entryId = req.params.id;
    
    if (!entryId) {
      return res.status(400).json({ success: false, message: 'Entry ID is required' });
    }

    const existingEntry = await journalModel.getEntryById(entryId);
    
    if (!existingEntry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    if (String(existingEntry.user_id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this entry' });
    }

    const updatedEntry = await journalModel.updateEntry(entryId, req.body);
    
    if (!updatedEntry) {
      return res.status(404).json({ success: false, message: 'Failed to update entry' });
    }
    
    res.status(200).json({ success: true, entry: updatedEntry });
  } catch (err) {
    console.error('Error updating journal entry:', err);
    res.status(500).json({ success: false, message: 'Failed to update journal entry' });
  }
};

const deleteEntry = async (req, res) => {
  try {
    const entryId = req.params.id;
    
    if (!entryId) {
      return res.status(400).json({ success: false, message: 'Entry ID is required' });
    }

    const existingEntry = await journalModel.getEntryById(entryId);
    
    if (!existingEntry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    if (String(existingEntry.user_id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this entry' });
    }

    const result = await journalModel.deleteEntry(entryId);
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Failed to delete entry' });
    }
    
    res.status(200).json({ success: true, message: 'Entry deleted successfully' });
  } catch (err) {
    console.error('Error deleting journal entry:', err);
    res.status(500).json({ success: false, message: 'Failed to delete journal entry' });
  }
};

module.exports = {
  createEntry,
  getUserEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
};