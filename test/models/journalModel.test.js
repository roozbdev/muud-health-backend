const journalModel = require('../../src/models/journalModel');
const db = require('../../src/config/db');

jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
}));

describe('Journal Model Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createEntry', () => {
    it('should create a journal entry successfully', async () => {
      const entryData = {
        user_id: 'user123',
        entry_text: 'Test journal entry',
        mood_rating: 4,
        timestamp: new Date().toISOString()
      };
      
      db.query.mockResolvedValueOnce({
        rows: [{ id: 'entry123' }]
      });
      
      const result = await journalModel.createEntry(entryData);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO journal_entries'),
        [entryData.user_id, entryData.entry_text, entryData.mood_rating, entryData.timestamp]
      );
      expect(result).toBe('entry123');
    });
    
    it('should handle database errors when creating an entry', async () => {
      const entryData = {
        user_id: 'user123',
        entry_text: 'Test journal entry',
        mood_rating: 4,
        timestamp: new Date().toISOString()
      };
      
      const dbError = new Error('Database error');
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(journalModel.createEntry(entryData)).rejects.toThrow(dbError);
    });
  });
  
  describe('getUserEntries', () => {
    it('should get all entries for a user successfully', async () => {
      const userId = 'user123';
      
      const mockEntries = [
        { id: 'entry1', user_id: userId, entry_text: 'Entry 1', mood_rating: 4 },
        { id: 'entry2', user_id: userId, entry_text: 'Entry 2', mood_rating: 5 }
      ];
      db.query.mockResolvedValueOnce({
        rows: mockEntries
      });
      
      const result = await journalModel.getUserEntries(userId);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [userId]
      );
      expect(result).toEqual(mockEntries);
    });
    
    it('should return an empty array when no entries exist', async () => {
      const userId = 'user123';
      
      db.query.mockResolvedValueOnce({
        rows: []
      });
      
      const result = await journalModel.getUserEntries(userId);
      
      expect(result).toEqual([]);
    });
    
    it('should handle database errors when getting user entries', async () => {
      const userId = 'user123';
      
      const dbError = new Error('Database error');
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(journalModel.getUserEntries(userId)).rejects.toThrow(dbError);
    });
  });
  
  describe('getEntryById', () => {
    it('should get a single entry by ID successfully', async () => {
      const entryId = 'entry123';
      
      const mockEntry = {
        id: entryId,
        user_id: 'user123',
        entry_text: 'Test entry',
        mood_rating: 4
      };
      db.query.mockResolvedValueOnce({
        rows: [mockEntry]
      });
      
      const result = await journalModel.getEntryById(entryId);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [entryId]
      );
      expect(result).toEqual(mockEntry);
    });
    
    it('should return null when entry does not exist', async () => {
      const entryId = 'nonexistent';
      
      db.query.mockResolvedValueOnce({
        rows: []
      });
      
      const result = await journalModel.getEntryById(entryId);
      
      expect(result).toBeNull();
    });
    
    it('should handle database errors when getting an entry by ID', async () => {
      const entryId = 'entry123';
      
      const dbError = new Error('Database error');
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(journalModel.getEntryById(entryId)).rejects.toThrow(dbError);
    });
  });
  
  describe('updateEntry', () => {
    it('should update an entry successfully', async () => {
      const entryId = 'entry123';
      const entryData = {
        entry_text: 'Updated entry text',
        mood_rating: 5
      };
      
      const mockUpdatedEntry = {
        id: entryId,
        user_id: 'user123',
        entry_text: entryData.entry_text,
        mood_rating: entryData.mood_rating
      };
      db.query.mockResolvedValueOnce({
        rows: [mockUpdatedEntry]
      });
      
      const result = await journalModel.updateEntry(entryId, entryData);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE journal_entries'),
        [entryData.entry_text, entryData.mood_rating, entryId]
      );
      expect(result).toEqual(mockUpdatedEntry);
    });
    
    it('should return null when update fails', async () => {
      const entryId = 'nonexistent';
      const entryData = {
        entry_text: 'Updated entry text',
        mood_rating: 5
      };
      
      db.query.mockResolvedValueOnce({
        rows: []
      });
      
      const result = await journalModel.updateEntry(entryId, entryData);
      
      expect(result).toBeNull();
    });
    
    it('should handle database errors when updating an entry', async () => {
      const entryId = 'entry123';
      const entryData = {
        entry_text: 'Updated entry text',
        mood_rating: 5
      };
      
      const dbError = new Error('Database error');
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(journalModel.updateEntry(entryId, entryData)).rejects.toThrow(dbError);
    });
  });
  
  describe('deleteEntry', () => {
    it('should delete an entry successfully', async () => {
      const entryId = 'entry123';
      
      db.query.mockResolvedValueOnce({
        rows: [{ id: entryId }]
      });
      
      const result = await journalModel.deleteEntry(entryId);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM journal_entries'),
        [entryId]
      );
      expect(result).toBe(true);
    });
    
    it('should return false when delete fails', async () => {
      const entryId = 'nonexistent';
      
      db.query.mockResolvedValueOnce({
        rows: []
      });
      
      const result = await journalModel.deleteEntry(entryId);
      
      expect(result).toBe(false);
    });
    
    it('should handle database errors when deleting an entry', async () => {
      const entryId = 'entry123';
      
      const dbError = new Error('Database error');
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(journalModel.deleteEntry(entryId)).rejects.toThrow(dbError);
    });
  });
});