const userModel = require('../../src/models/userModel');
const db = require('../../src/config/db');
const bcrypt = require('bcrypt');

jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('User Model Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const hashedPassword = 'hashed_password_value';
      bcrypt.hash.mockResolvedValueOnce(hashedPassword);
      
      const newUser = {
        id: 'user123',
        username: userData.username,
        email: userData.email,
        created_at: new Date().toISOString()
      };
      db.query.mockResolvedValueOnce({
        rows: [newUser]
      });
      
      const result = await userModel.createUser(userData);
      
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [userData.username, userData.email, hashedPassword]
      );
      expect(result).toEqual(newUser);
    });
    
    it('should handle username already exists error', async () => {
      const userData = {
        username: 'existing',
        email: 'test@example.com',
        password: 'password123'
      };
      
      bcrypt.hash.mockResolvedValueOnce('hashed_password');
      
      const dbError = new Error('Database error');
      dbError.code = '23505';
      dbError.constraint = 'users_username_key';
      
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(userModel.createUser(userData)).rejects.toThrow('Username already exists');
    });
    
    it('should handle email already exists error', async () => {
      const userData = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      bcrypt.hash.mockResolvedValueOnce('hashed_password');
      
      const dbError = new Error('Database error');
      dbError.code = '23505';
      dbError.constraint = 'users_email_key';
      
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(userModel.createUser(userData)).rejects.toThrow('Email already exists');
    });
    
    it('should handle generic database errors', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      bcrypt.hash.mockResolvedValueOnce('hashed_password');
      
      const dbError = new Error('Database error');
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(userModel.createUser(userData)).rejects.toThrow(dbError);
    });
  });
  
  describe('getUserByUsername', () => {
    it('should get a user by username successfully', async () => {
      const username = 'testuser';
      
      const mockUser = {
        id: 'user123',
        username,
        email: 'test@example.com',
        password: 'hashed_password',
        created_at: new Date().toISOString()
      };
      db.query.mockResolvedValueOnce({
        rows: [mockUser]
      });
      
      const result = await userModel.getUserByUsername(username);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [username]
      );
      expect(result).toEqual(mockUser);
    });
    
    it('should return undefined when username not found', async () => {
      const username = 'nonexistent';
      
      db.query.mockResolvedValueOnce({
        rows: []
      });
      
      const result = await userModel.getUserByUsername(username);
      
      expect(result).toBeUndefined();
    });
    
    it('should handle database errors when getting by username', async () => {
      const username = 'testuser';
      
      const dbError = new Error('Database error');
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(userModel.getUserByUsername(username)).rejects.toThrow(dbError);
    });
  });
  
  describe('getUserByEmail', () => {
    it('should get a user by email successfully', async () => {
      const email = 'test@example.com';
      
      const mockUser = {
        id: 'user123',
        username: 'testuser',
        email,
        password: 'hashed_password',
        created_at: new Date().toISOString()
      };
      db.query.mockResolvedValueOnce({
        rows: [mockUser]
      });
      
      const result = await userModel.getUserByEmail(email);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [email]
      );
      expect(result).toEqual(mockUser);
    });
    
    it('should return undefined when email not found', async () => {
      const email = 'nonexistent@example.com';
      
      db.query.mockResolvedValueOnce({
        rows: []
      });
      
      const result = await userModel.getUserByEmail(email);
      
      expect(result).toBeUndefined();
    });
    
    it('should handle database errors when getting by email', async () => {
      const email = 'test@example.com';
      
      const dbError = new Error('Database error');
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(userModel.getUserByEmail(email)).rejects.toThrow(dbError);
    });
  });
  
  describe('getUserById', () => {
    it('should get a user by ID successfully', async () => {
      const userId = 'user123';
      
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        created_at: new Date().toISOString()
      };
      db.query.mockResolvedValueOnce({
        rows: [mockUser]
      });
      
      const result = await userModel.getUserById(userId);
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [userId]
      );
      expect(result).toEqual(mockUser);
    });
    
    it('should return undefined when user ID not found', async () => {
      const userId = 'nonexistent';
      
      db.query.mockResolvedValueOnce({
        rows: []
      });
      
      const result = await userModel.getUserById(userId);
      
      expect(result).toBeUndefined();
    });
    
    it('should handle database errors when getting by ID', async () => {
      const userId = 'user123';
      
      const dbError = new Error('Database error');
      db.query.mockRejectedValueOnce(dbError);
      
      await expect(userModel.getUserById(userId)).rejects.toThrow(dbError);
    });
  });
  
  describe('verifyPassword', () => {
    it('should return true for valid password', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashed_password';
      
      bcrypt.compare.mockResolvedValueOnce(true);
      
      const result = await userModel.verifyPassword(plainPassword, hashedPassword);
      
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });
    
    it('should return false for invalid password', async () => {
      const plainPassword = 'wrong_password';
      const hashedPassword = 'hashed_password';
      
      bcrypt.compare.mockResolvedValueOnce(false);
      
      const result = await userModel.verifyPassword(plainPassword, hashedPassword);
      
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(false);
    });
    
    it('should handle bcrypt errors', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashed_password';
      
      const bcryptError = new Error('Bcrypt error');
      bcrypt.compare.mockRejectedValueOnce(bcryptError);
      
      await expect(userModel.verifyPassword(plainPassword, hashedPassword)).rejects.toThrow(bcryptError);
    });
  });
});