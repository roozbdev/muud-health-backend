const { validate, journalEntrySchema, contactSchema, registerSchema, loginSchema } = require('../../src/middleware/validationMiddleware');

describe('Validation Middleware Tests', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });
  
  describe('validate middleware function', () => {
    it('should call next() when validation passes', () => {
      const testSchema = {
        validate: jest.fn().mockReturnValue({
          value: { test: 'validated' }
        })
      };
      
      req.body = { test: 'data' };
      
      validate(testSchema)(req, res, next);
      
      expect(testSchema.validate).toHaveBeenCalledWith(req.body);
      expect(req.body).toEqual({ test: 'validated' });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
    
    it('should return 400 when validation fails', () => {
      const validationError = {
        details: [{ message: 'Validation failed' }]
      };
      const testSchema = {
        validate: jest.fn().mockReturnValue({
          error: validationError
        })
      };
      
      req.body = { test: 'invalid' };
      
      validate(testSchema)(req, res, next);
      
      expect(testSchema.validate).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('journalEntrySchema', () => {
    it('should validate a valid journal entry', () => {
      const entryData = {
        user_id: 'user123',
        entry_text: 'This is a test journal entry',
        mood_rating: 4,
        timestamp: new Date().toISOString()
      };
      
      const { error } = journalEntrySchema.validate(entryData);
      
      expect(error).toBeUndefined();
    });
    
    it('should reject invalid mood_rating', () => {
      const entryData = {
        user_id: 'user123',
        entry_text: 'This is a test journal entry',
        mood_rating: 6,
        timestamp: new Date().toISOString()
      };
      
      const { error } = journalEntrySchema.validate(entryData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('mood_rating');
    });
    
    it('should reject missing required fields', () => {
      const entryData = {
        user_id: 'user123',
        timestamp: new Date().toISOString()
      };
      
      const { error } = journalEntrySchema.validate(entryData);
      
      expect(error).toBeDefined();
    });
  });
  
  describe('contactSchema', () => {
    it('should validate a valid contact', () => {
      const contactData = {
        user_id: 'user123',
        contact_name: 'John Doe',
        contact_email: 'john@example.com'
      };
      
      const { error } = contactSchema.validate(contactData);
      
      expect(error).toBeUndefined();
    });
    
    it('should reject invalid email format', () => {
      const contactData = {
        user_id: 'user123',
        contact_name: 'John Doe',
        contact_email: 'invalid-email'
      };
      
      const { error } = contactSchema.validate(contactData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('contact_email');
    });
    
    it('should reject missing required fields', () => {
      const contactData = {
        user_id: 'user123',
        contact_email: 'john@example.com'
      };
      
      const { error } = contactSchema.validate(contactData);
      
      expect(error).toBeDefined();
    });
  });
  
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const { error } = registerSchema.validate(registerData);
      
      expect(error).toBeUndefined();
    });
    
    it('should reject username with non-alphanumeric characters', () => {
      const registerData = {
        username: 'test-user!',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const { error } = registerSchema.validate(registerData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('username');
    });
    
    it('should reject username that is too short', () => {
      const registerData = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const { error } = registerSchema.validate(registerData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('username');
    });
    
    it('should reject invalid email format', () => {
      const registerData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };
      
      const { error } = registerSchema.validate(registerData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('email');
    });
    
    it('should reject password that is too short', () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '12345'
      };
      
      const { error } = registerSchema.validate(registerData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('password');
    });
  });
  
  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };
      
      const { error } = loginSchema.validate(loginData);
      
      expect(error).toBeUndefined();
    });
    
    it('should reject missing username', () => {
      const loginData = {
        password: 'password123'
      };
      
      const { error } = loginSchema.validate(loginData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('username');
    });
    
    it('should reject missing password', () => {
      const loginData = {
        username: 'testuser'
      };
      
      const { error } = loginSchema.validate(loginData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('password');
    });
  });
});