const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');
const { validate, contactSchema, contactUpdateSchema } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, validate(contactSchema), contactsController.addContact);

router.get('/user/:id', protect, contactsController.getUserContacts);

router.get('/:id', protect, contactsController.getContactById);

router.put('/:id', protect, validate(contactUpdateSchema), contactsController.updateContact);

router.delete('/:id', protect, contactsController.deleteContact);

router.delete('/delete/:id', protect, contactsController.deleteContact);

router.delete('/direct-delete/:id', protect, (req, res) => {
  const contactId = req.params.id;
  console.log(`Direct delete contact request for ID: ${contactId}`);
  
  res.status(200).json({ 
    success: true, 
    message: 'Direct delete endpoint for contacts reached successfully',
    contact_id: contactId
  });
});

module.exports = router;