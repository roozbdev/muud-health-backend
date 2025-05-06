const jwt = require('jsonwebtoken');
const authController = require('../../src/controllers/authController');
const userModel = require('../../src/models/userModel');

jest.mock('../../src/models/userModel');

jest.mock('jsonwebtoken');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller Tests', () => {
  let req, res;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      body: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      },
      user: {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com'
      }
    };
    
    res = mockResponse();
    
    jwt.sign.mockReturnValue('mock-jwt-token');
  });
  
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockNewUser = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com'
      };
      userModel.createUser.mockResolvedValueOnce(mockNewUser);
      
      await authController.register(req, res);
      
      expect(userModel.createUser).toHaveBeenCalledWith({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockNewUser.id, username: mockNewUser.username },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: {
          id: mockNewUser.id,
          username: mockNewUser.username,
          email: mockNewUser.email
        },
        token: 'mock-jwt-token'
      });
    });
    
    it('should handle duplicate username error', async () => {
      const error = new Error('Username already exists');
      userModel.createUser.mockRejectedValueOnce(error);
      
      await authController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username already exists'
      });
    });
    
    it('should handle duplicate email error', async () => {
      const error = new Error('Email already exists');
      userModel.createUser.mockRejectedValueOnce(error);
      
      await authController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email already exists'
      });
    });
    
    it('should handle general errors during registration', async () => {
      userModel.createUser.mockRejectedValueOnce(new Error('Database error'));
      
      await authController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to register user'
      });
    });
  });
  
  describe('login', () => {
    it('should login a user successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed_password'
      };
      userModel.getUserByUsername.mockResolvedValueOnce(mockUser);
      userModel.verifyPassword.mockResolvedValueOnce(true);
      
      await authController.login(req, res);
      
      expect(userModel.getUserByUsername).toHaveBeenCalledWith(req.body.username);
      expect(userModel.verifyPassword).toHaveBeenCalledWith(req.body.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, username: mockUser.username },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email
        },
        token: 'mock-jwt-token'
      });
    });
    
    it('should handle non-existent username', async () => {
      userModel.getUserByUsername.mockResolvedValueOnce(null);
      
      await authController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid username or password'
      });
      expect(userModel.verifyPassword).not.toHaveBeenCalled();
    });
    
    it('should handle invalid password', async () => {
      const mockUser = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed_password'
      };
      userModel.getUserByUsername.mockResolvedValueOnce(mockUser);
      userModel.verifyPassword.mockResolvedValueOnce(false);
      
      await authController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid username or password'
      });
      expect(jwt.sign).not.toHaveBeenCalled();
    });
    
    it('should handle errors during login', async () => {
      userModel.getUserByUsername.mockRejectedValueOnce(new Error('Database error'));
      
      await authController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to login'
      });
    });
  });
  
  describe('getMe', () => {
    it('should get the authenticated user successfully', async () => {
      const mockUser = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com'
      };
      userModel.getUserById.mockResolvedValueOnce(mockUser);
      
      await authController.getMe(req, res);
      
      expect(userModel.getUserById).toHaveBeenCalledWith(req.user.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email
        }
      });
    });
    
    it('should handle user not found', async () => {
      userModel.getUserById.mockResolvedValueOnce(null);
      
      await authController.getMe(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
    
    it('should handle errors when retrieving user profile', async () => {
      userModel.getUserById.mockRejectedValueOnce(new Error('Database error'));
      
      await authController.getMe(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get user profile'
      });
    });
  });
});