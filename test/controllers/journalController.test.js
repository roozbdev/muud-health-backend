const journalController = require('../../src/controllers/journalController');
const journalModel = require('../../src/models/journalModel');

jest.mock('../../src/models/journalModel');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Journal Controller Tests', () => {
  let req, res;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      body: {
        user_id: 'user123',
        entry_text: 'Test journal entry',
        mood_rating: 4,
        timestamp: new Date().toISOString()
      },
      params: {
        id: 'entry123'
      },
      user: {
        id: 'user123'
      }
    };
    
    res = mockResponse();
  });
  
  describe('createEntry', () => {
    it('should create a journal entry successfully', async () => {
      journalModel.createEntry.mockResolvedValueOnce('entry123');
      
      await journalController.createEntry(req, res);
      
      expect(journalModel.createEntry).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        entry_id: 'entry123'
      });
    });
    
    it('should handle errors when creating an entry', async () => {
      journalModel.createEntry.mockRejectedValueOnce(new Error('Database error'));
      
      await journalController.createEntry(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create journal entry'
      });
    });
  });
  
  describe('getUserEntries', () => {
    it('should get all user entries successfully', async () => {
      const mockEntries = [
        { id: 'entry1', user_id: 'user123', entry_text: 'Entry 1', mood_rating: 4 },
        { id: 'entry2', user_id: 'user123', entry_text: 'Entry 2', mood_rating: 5 }
      ];
      journalModel.getUserEntries.mockResolvedValueOnce(mockEntries);
      
      await journalController.getUserEntries(req, res);
      
      expect(journalModel.getUserEntries).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ entries: mockEntries });
    });
    
    it('should handle missing user ID', async () => {
      req.params.id = null;
      
      await journalController.getUserEntries(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User ID is required'
      });
    });
    
    it('should handle errors when retrieving entries', async () => {
      journalModel.getUserEntries.mockRejectedValueOnce(new Error('Database error'));
      
      await journalController.getUserEntries(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve journal entries'
      });
    });
  });
  
  describe('getEntryById', () => {
    it('should get a single entry successfully', async () => {
      const mockEntry = {
        id: 'entry123',
        user_id: 'user123',
        entry_text: 'Test entry',
        mood_rating: 4
      };
      journalModel.getEntryById.mockResolvedValueOnce(mockEntry);
      
      await journalController.getEntryById(req, res);
      
      expect(journalModel.getEntryById).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        entry: mockEntry
      });
    });
    
    it('should handle entry not found', async () => {
      journalModel.getEntryById.mockResolvedValueOnce(null);
      
      await journalController.getEntryById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Entry not found'
      });
    });
    
    it('should handle unauthorized access to an entry', async () => {
      const mockEntry = {
        id: 'entry123',
        user_id: 'differentUser',
        entry_text: 'Test entry',
        mood_rating: 4
      };
      journalModel.getEntryById.mockResolvedValueOnce(mockEntry);
      
      await journalController.getEntryById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to access this entry'
      });
    });
    
    it('should handle errors when retrieving an entry', async () => {
      journalModel.getEntryById.mockRejectedValueOnce(new Error('Database error'));
      
      await journalController.getEntryById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve journal entry'
      });
    });
  });
  
  describe('updateEntry', () => {
    beforeEach(() => {
      req.body = {
        entry_text: 'Updated entry text',
        mood_rating: 5
      };
    });
    
    it('should update an entry successfully', async () => {
      const mockExistingEntry = {
        id: 'entry123',
        user_id: 'user123',
        entry_text: 'Original text',
        mood_rating: 4
      };
      const mockUpdatedEntry = {
        id: 'entry123',
        user_id: 'user123',
        entry_text: 'Updated entry text',
        mood_rating: 5
      };
      journalModel.getEntryById.mockResolvedValueOnce(mockExistingEntry);
      journalModel.updateEntry.mockResolvedValueOnce(mockUpdatedEntry);
      
      await journalController.updateEntry(req, res);
      
      expect(journalModel.getEntryById).toHaveBeenCalledWith(req.params.id);
      expect(journalModel.updateEntry).toHaveBeenCalledWith(req.params.id, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        entry: mockUpdatedEntry
      });
    });
    
    it('should handle entry not found when updating', async () => {
      journalModel.getEntryById.mockResolvedValueOnce(null);
      
      await journalController.updateEntry(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Entry not found'
      });
      expect(journalModel.updateEntry).not.toHaveBeenCalled();
    });
    
    it('should handle unauthorized access when updating', async () => {
      const mockExistingEntry = {
        id: 'entry123',
        user_id: 'differentUser',
        entry_text: 'Original text',
        mood_rating: 4
      };
      journalModel.getEntryById.mockResolvedValueOnce(mockExistingEntry);
      
      await journalController.updateEntry(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to update this entry'
      });
      expect(journalModel.updateEntry).not.toHaveBeenCalled();
    });
    
    it('should handle update failure', async () => {
      const mockExistingEntry = {
        id: 'entry123',
        user_id: 'user123',
        entry_text: 'Original text',
        mood_rating: 4
      };
      journalModel.getEntryById.mockResolvedValueOnce(mockExistingEntry);
      journalModel.updateEntry.mockResolvedValueOnce(null);
      
      await journalController.updateEntry(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to update entry'
      });
    });
    
    it('should handle errors when updating an entry', async () => {
      const mockExistingEntry = {
        id: 'entry123',
        user_id: 'user123',
        entry_text: 'Original text',
        mood_rating: 4
      };
      journalModel.getEntryById.mockResolvedValueOnce(mockExistingEntry);
      journalModel.updateEntry.mockRejectedValueOnce(new Error('Database error'));
      
      await journalController.updateEntry(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to update journal entry'
      });
    });
  });
  
  describe('deleteEntry', () => {
    it('should delete an entry successfully', async () => {
      const mockExistingEntry = {
        id: 'entry123',
        user_id: 'user123',
        entry_text: 'Test entry',
        mood_rating: 4
      };
      journalModel.getEntryById.mockResolvedValueOnce(mockExistingEntry);
      journalModel.deleteEntry.mockResolvedValueOnce(true);
      
      await journalController.deleteEntry(req, res);
      
      expect(journalModel.getEntryById).toHaveBeenCalledWith(req.params.id);
      expect(journalModel.deleteEntry).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Entry deleted successfully'
      });
    });
    
    it('should handle entry not found when deleting', async () => {
      journalModel.getEntryById.mockResolvedValueOnce(null);
      
      await journalController.deleteEntry(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Entry not found'
      });
      expect(journalModel.deleteEntry).not.toHaveBeenCalled();
    });
    
    it('should handle unauthorized access when deleting', async () => {
      const mockExistingEntry = {
        id: 'entry123',
        user_id: 'differentUser',
        entry_text: 'Test entry',
        mood_rating: 4
      };
      journalModel.getEntryById.mockResolvedValueOnce(mockExistingEntry);
      
      await journalController.deleteEntry(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to delete this entry'
      });
      expect(journalModel.deleteEntry).not.toHaveBeenCalled();
    });
    
    it('should handle delete failure', async () => {
      const mockExistingEntry = {
        id: 'entry123',
        user_id: 'user123',
        entry_text: 'Test entry',
        mood_rating: 4
      };
      journalModel.getEntryById.mockResolvedValueOnce(mockExistingEntry);
      journalModel.deleteEntry.mockResolvedValueOnce(false);
      
      await journalController.deleteEntry(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to delete entry'
      });
    });
    
    it('should handle errors when deleting an entry', async () => {
      const mockExistingEntry = {
        id: 'entry123',
        user_id: 'user123',
        entry_text: 'Test entry',
        mood_rating: 4
      };
      journalModel.getEntryById.mockResolvedValueOnce(mockExistingEntry);
      journalModel.deleteEntry.mockRejectedValueOnce(new Error('Database error'));
      
      await journalController.deleteEntry(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to delete journal entry'
      });
    });
  });
});