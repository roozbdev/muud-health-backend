const contactsController = require('../../src/controllers/contactsController');
const contactsModel = require('../../src/models/contactsModel');

jest.mock('../../src/models/contactsModel');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Contacts Controller Tests', () => {
  let req, res;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      body: {
        user_id: 'user123',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      },
      params: {
        id: 'contact123'
      },
      user: {
        id: 'user123'
      }
    };
    
    res = mockResponse();
  });
  
  describe('addContact', () => {
    it('should add a contact successfully', async () => {
      contactsModel.addContact.mockResolvedValueOnce('contact123');
      
      await contactsController.addContact(req, res);
      
      expect(contactsModel.addContact).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        contact_id: 'contact123'
      });
    });
    
    it('should handle errors when adding a contact', async () => {
      contactsModel.addContact.mockRejectedValueOnce(new Error('Database error'));
      
      await contactsController.addContact(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to add contact'
      });
    });
  });
  
  describe('getUserContacts', () => {
    it('should get all user contacts successfully', async () => {
      const mockContacts = [
        { id: 'contact1', user_id: 'user123', contact_name: 'John Doe', contact_email: 'john@example.com' },
        { id: 'contact2', user_id: 'user123', contact_name: 'Jane Smith', contact_email: 'jane@example.com' }
      ];
      contactsModel.getUserContacts.mockResolvedValueOnce(mockContacts);
      
      await contactsController.getUserContacts(req, res);
      
      expect(contactsModel.getUserContacts).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ contacts: mockContacts });
    });
    
    it('should handle missing user ID', async () => {
      req.params.id = null;
      
      await contactsController.getUserContacts(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User ID is required'
      });
    });
    
    it('should handle errors when retrieving contacts', async () => {
      contactsModel.getUserContacts.mockRejectedValueOnce(new Error('Database error'));
      
      await contactsController.getUserContacts(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve contacts'
      });
    });
  });
  
  describe('getContactById', () => {
    it('should get a single contact successfully', async () => {
      const mockContact = {
        id: 'contact123',
        user_id: 'user123',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      };
      contactsModel.getContactById.mockResolvedValueOnce(mockContact);
      
      await contactsController.getContactById(req, res);
      
      expect(contactsModel.getContactById).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        contact: mockContact
      });
    });
    
    it('should handle contact not found', async () => {
      contactsModel.getContactById.mockResolvedValueOnce(null);
      
      await contactsController.getContactById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Contact not found'
      });
    });
    
    it('should handle unauthorized access to a contact', async () => {
      const mockContact = {
        id: 'contact123',
        user_id: 'differentUser',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      };
      contactsModel.getContactById.mockResolvedValueOnce(mockContact);
      
      await contactsController.getContactById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to access this contact'
      });
    });
    
    it('should handle errors when retrieving a contact', async () => {
      contactsModel.getContactById.mockRejectedValueOnce(new Error('Database error'));
      
      await contactsController.getContactById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve contact'
      });
    });
  });
  
  describe('updateContact', () => {
    beforeEach(() => {
      req.body = {
        contact_name: 'Updated Name',
        contact_email: 'updated@example.com'
      };
    });
    
    it('should update a contact successfully', async () => {
      const mockExistingContact = {
        id: 'contact123',
        user_id: 'user123',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      };
      const mockUpdatedContact = {
        id: 'contact123',
        user_id: 'user123',
        contact_name: 'Updated Name',
        contact_email: 'updated@example.com'
      };
      contactsModel.getContactById.mockResolvedValueOnce(mockExistingContact);
      contactsModel.updateContact.mockResolvedValueOnce(mockUpdatedContact);
      
      await contactsController.updateContact(req, res);
      
      expect(contactsModel.getContactById).toHaveBeenCalledWith(req.params.id);
      expect(contactsModel.updateContact).toHaveBeenCalledWith(req.params.id, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        contact: mockUpdatedContact
      });
    });
    
    it('should handle contact not found when updating', async () => {
      contactsModel.getContactById.mockResolvedValueOnce(null);
      
      await contactsController.updateContact(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Contact not found'
      });
      expect(contactsModel.updateContact).not.toHaveBeenCalled();
    });
    
    it('should handle unauthorized access when updating', async () => {
      const mockExistingContact = {
        id: 'contact123',
        user_id: 'differentUser',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      };
      contactsModel.getContactById.mockResolvedValueOnce(mockExistingContact);
      
      await contactsController.updateContact(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to update this contact'
      });
      expect(contactsModel.updateContact).not.toHaveBeenCalled();
    });
    
    it('should handle update failure', async () => {
      const mockExistingContact = {
        id: 'contact123',
        user_id: 'user123',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      };
      contactsModel.getContactById.mockResolvedValueOnce(mockExistingContact);
      contactsModel.updateContact.mockResolvedValueOnce(null);
      
      await contactsController.updateContact(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to update contact'
      });
    });
    
    it('should handle errors when updating a contact', async () => {
      const mockExistingContact = {
        id: 'contact123',
        user_id: 'user123',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      };
      contactsModel.getContactById.mockResolvedValueOnce(mockExistingContact);
      contactsModel.updateContact.mockRejectedValueOnce(new Error('Database error'));
      
      await contactsController.updateContact(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to update contact'
      });
    });
  });
  
  describe('deleteContact', () => {
    it('should delete a contact successfully', async () => {
      const mockExistingContact = {
        id: 'contact123',
        user_id: 'user123',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      };
      contactsModel.getContactById.mockResolvedValueOnce(mockExistingContact);
      contactsModel.deleteContact.mockResolvedValueOnce(true);
      
      await contactsController.deleteContact(req, res);
      
      expect(contactsModel.getContactById).toHaveBeenCalledWith(req.params.id);
      expect(contactsModel.deleteContact).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Contact deleted successfully'
      });
    });
    
    it('should handle contact not found when deleting', async () => {
      contactsModel.getContactById.mockResolvedValueOnce(null);
      
      await contactsController.deleteContact(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Contact not found'
      });
      expect(contactsModel.deleteContact).not.toHaveBeenCalled();
    });
    
    it('should handle unauthorized access when deleting', async () => {
      const mockExistingContact = {
        id: 'contact123',
        user_id: 'differentUser',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      };
      contactsModel.getContactById.mockResolvedValueOnce(mockExistingContact);
      
      await contactsController.deleteContact(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to delete this contact'
      });
      expect(contactsModel.deleteContact).not.toHaveBeenCalled();
    });
    
    it('should handle delete failure', async () => {
      const mockExistingContact = {
        id: 'contact123',
        user_id: 'user123',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      };
      contactsModel.getContactById.mockResolvedValueOnce(mockExistingContact);
      contactsModel.deleteContact.mockResolvedValueOnce(false);
      
      await contactsController.deleteContact(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to delete contact'
      });
    });
    
    it('should handle errors when deleting a contact', async () => {
      const mockExistingContact = {
        id: 'contact123',
        user_id: 'user123',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      };
      contactsModel.getContactById.mockResolvedValueOnce(mockExistingContact);
      contactsModel.deleteContact.mockRejectedValueOnce(new Error('Database error'));
      
      await contactsController.deleteContact(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to delete contact'
      });
    });
  });
});