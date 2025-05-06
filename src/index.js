const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const journalRoutes = require('./routes/journalRoutes');
const contactsRoutes = require('./routes/contactsRoutes');
const authRoutes = require('./routes/authRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    return res.status(200).json({});
  }
  
  next();
});

app.use('/auth', authRoutes);
app.use('/journal', journalRoutes);
app.use('/contacts', contactsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MUUD Health API' });
});

app.delete('/debug-delete-test/:id', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'DELETE functionality is working', 
    id: req.params.id 
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // for testing