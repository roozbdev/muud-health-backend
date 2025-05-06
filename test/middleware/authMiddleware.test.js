const jwt = require('jsonwebtoken');
const { protect } = require('../../src/middleware/authMiddleware');
const userModel = require('../../src/models/userModel');

jest.mock('jsonwebtoken');
jest.mock('../../src/models/userModel');

describe('Auth Middleware Tests', () => {
  let req, res, next;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      headers: {
        authorization: 'Bearer test-token'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });
  
  it('should call next() when valid token provided', async () => {
    const decodedToken = { id: 'user123' };
    jwt.verify.mockReturnValueOnce(decodedToken);
    
    const mockUser = {
      id: 'user123',
      username: 'testuser',
      email: 'test@example.com'
    };
    userModel.getUserById.mockResolvedValueOnce(mockUser);

    await protect(req, res, next);
    
    expect(jwt.verify).toHaveBeenCalledWith('test-token', expect.any(String));
    expect(userModel.getUserById).toHaveBeenCalledWith(decodedToken.id);
    expect(req.user).toEqual({
      id: mockUser.id,
      username: mockUser.username,
      email: mockUser.email
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  
  it('should return 401 when no token is provided', async () => {
    req.headers.authorization = undefined;
    
    await protect(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized, no token provided'
    });
    expect(next).not.toHaveBeenCalled();
  });
  
  it('should return 401 for invalid token format', async () => {
    req.headers.authorization = 'Invalid-format';
    
    await protect(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized, no token provided'
    });
    expect(next).not.toHaveBeenCalled();
  });
  
  it('should return 401 when token verification fails', async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });
    
    await protect(req, res, next);
    
    expect(jwt.verify).toHaveBeenCalledWith('test-token', expect.any(String));
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized, invalid token'
    });
    expect(next).not.toHaveBeenCalled();
  });
  
  it('should return 401 when user not found', async () => {
    const decodedToken = { id: 'nonexistent-user' };
    jwt.verify.mockReturnValueOnce(decodedToken);
    
    userModel.getUserById.mockResolvedValueOnce(null);
    
    await protect(req, res, next);
    
    expect(jwt.verify).toHaveBeenCalledWith('test-token', expect.any(String));
    expect(userModel.getUserById).toHaveBeenCalledWith(decodedToken.id);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized, user not found'
    });
    expect(next).not.toHaveBeenCalled();
  });
  
  it('should handle database errors when getting user', async () => {
    const decodedToken = { id: 'user123' };
    jwt.verify.mockReturnValueOnce(decodedToken);
    
    const dbError = new Error('Database error');
    userModel.getUserById.mockRejectedValueOnce(dbError);
    
    await protect(req, res, next);
    
    expect(jwt.verify).toHaveBeenCalledWith('test-token', expect.any(String));
    expect(userModel.getUserById).toHaveBeenCalledWith(decodedToken.id);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized, invalid token'
    });
    expect(next).not.toHaveBeenCalled();
  });
});