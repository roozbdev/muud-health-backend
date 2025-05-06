const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'muud-health-jwt-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';


const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const newUser = await userModel.createUser({ username, email, password });
    
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      },
      token
    });
    
  } catch (err) {
    if (err.message === 'Username already exists' || err.message === 'Email already exists') {
      return res.status(409).json({ success: false, message: err.message });
    }
    
    console.error('Error registering user:', err);
    res.status(500).json({ success: false, message: 'Failed to register user' });
  }
};


const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await userModel.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    const isPasswordValid = await userModel.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
    
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ success: false, message: 'Failed to login' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (err) {
    console.error('Error getting user profile:', err);
    res.status(500).json({ success: false, message: 'Failed to get user profile' });
  }
};

module.exports = {
  register,
  login,
  getMe
};