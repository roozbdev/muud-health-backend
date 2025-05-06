const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, registerSchema, loginSchema } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', validate(registerSchema), authController.register);

router.post('/login', validate(loginSchema), authController.login);

router.get('/me', protect, authController.getMe);

module.exports = router;