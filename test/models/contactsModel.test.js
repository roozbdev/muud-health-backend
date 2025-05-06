const contactsModel = require('../../src/models/contactsModel');
const db = require('../../src/config/db');

jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
}));

describe('Contacts Model Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('addContact', () => {
    it('should add a contact successfully', async () => {
      const contactData = {
        user_id: 'user123',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      };
      
      db.query.mockResolvedValueOnce({
        rows: [{ id: 'contact123' }]
      });
      
      const result = await contactsModel.addContact(contactData);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO contacts'),
        [contactData.user_id, contactData.contact_name, contactData.contact_email]
      );
      expect(result).toBe('contact123');
    });
    
    it('should handle database errors when adding a contact', async () => {
      const contactData = {
        user_id: 'user123',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      };
      
      const dbError = new Error('Database error');
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(contactsModel.addContact(contactData)).rejects.toThrow(dbError);
    });
  });
  
  describe('getUserContacts', () => {
    it('should get all contacts for a user successfully', async () => {
      const userId = 'user123';
      
      const mockContacts = [
        { id: 'contact1', user_id: userId, contact_name: 'John Doe', contact_email: 'john@example.com' },
        { id: 'contact2', user_id: userId, contact_name: 'Jane Smith', contact_email: 'jane@example.com' }
      ];
      db.query.mockResolvedValueOnce({
        rows: mockContacts
      });
      
      const result = await contactsModel.getUserContacts(userId);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [userId]
      );
      expect(result).toEqual(mockContacts);
    });
    
    it('should return an empty array when no contacts exist', async () => {
      const userId = 'user123';
      
      db.query.mockResolvedValueOnce({
        rows: []
      });
      
      const result = await contactsModel.getUserContacts(userId);
      
      expect(result).toEqual([]);
    });
    
    it('should handle database errors when getting user contacts', async () => {
      const userId = 'user123';
      
      const dbError = new Error('Database error');
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(contactsModel.getUserContacts(userId)).rejects.toThrow(dbError);
    });
  });
  
  describe('getContactById', () => {
    it('should get a single contact by ID successfully', async () => {
      const contactId = 'contact123';
      
      const mockContact = {
        id: contactId,
        user_id: 'user123',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      };
      db.query.mockResolvedValueOnce({
        rows: [mockContact]
      });
      
      const result = await contactsModel.getContactById(contactId);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [contactId]
      );
      expect(result).toEqual(mockContact);
    });
    
    it('should return null when contact does not exist', async () => {
      const contactId = 'nonexistent';
      
      db.query.mockResolvedValueOnce({
        rows: []
      });
      
      const result = await contactsModel.getContactById(contactId);
      
      expect(result).toBeNull();
    });
    
    it('should handle database errors when getting a contact by ID', async () => {
      const contactId = 'contact123';
      
      const dbError = new Error('Database error');
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(contactsModel.getContactById(contactId)).rejects.toThrow(dbError);
    });
  });
  
  describe('updateContact', () => {
    it('should update a contact successfully', async () => {
      const contactId = 'contact123';
      const contactData = {
        contact_name: 'Updated Name',
        contact_email: 'updated@example.com'
      };
      
      const mockUpdatedContact = {
        id: contactId,
        user_id: 'user123',
        contact_name: contactData.contact_name,
        contact_email: contactData.contact_email
      };
      db.query.mockResolvedValueOnce({
        rows: [mockUpdatedContact]
      });
      
      const result = await contactsModel.updateContact(contactId, contactData);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE contacts'),
        [contactData.contact_name, contactData.contact_email, contactId]
      );
      expect(result).toEqual(mockUpdatedContact);
    });
    
    it('should return null when update fails', async () => {
      const contactId = 'nonexistent';
      const contactData = {
        contact_name: 'Updated Name',
        contact_email: 'updated@example.com'
      };
      
      db.query.mockResolvedValueOnce({
        rows: []
      });
      
      const result = await contactsModel.updateContact(contactId, contactData);
      
      expect(result).toBeNull();
    });
    
    it('should handle database errors when updating a contact', async () => {
      const contactId = 'contact123';
      const contactData = {
        contact_name: 'Updated Name',
        contact_email: 'updated@example.com'
      };
      
      const dbError = new Error('Database error');
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(contactsModel.updateContact(contactId, contactData)).rejects.toThrow(dbError);
    });
  });
  
  describe('deleteContact', () => {
    it('should delete a contact successfully', async () => {
      const contactId = 'contact123';
      
      db.query.mockResolvedValueOnce({
        rows: [{ id: contactId }]
      });
      
      const result = await contactsModel.deleteContact(contactId);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM contacts'),
        [contactId]
      );
      expect(result).toBe(true);
    });
    
    it('should return false when delete fails', async () => {
      const contactId = 'nonexistent';
      
      db.query.mockResolvedValueOnce({
        rows: []
      });
      
      const result = await contactsModel.deleteContact(contactId);
      
      expect(result).toBe(false);
    });
    
    it('should handle database errors when deleting a contact', async () => {
      const contactId = 'contact123';
      
      const dbError = new Error('Database error');
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(contactsModel.deleteContact(contactId)).rejects.toThrow(dbError);
    });
  });
});