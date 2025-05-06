const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const { validate, journalEntrySchema, journalUpdateSchema } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/entry', protect, validate(journalEntrySchema), journalController.createEntry);

router.get('/user/:id', protect, journalController.getUserEntries);

router.get('/entry/:id', protect, journalController.getEntryById);

router.put('/entry/:id', protect, validate(journalUpdateSchema), journalController.updateEntry);

router.delete('/entry/:id', protect, journalController.deleteEntry);

router.delete('/delete-entry/:id', protect, journalController.deleteEntry);

router.delete('/direct-delete/:id', protect, async (req, res) => {
  try {
    const entryId = req.params.id;
    console.log(`Direct delete request for entry ID: ${entryId}`);
    
    if (!entryId) {
      return res.status(400).json({ success: false, message: 'Entry ID is required' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Direct delete endpoint reached successfully',
      entry_id: entryId
    });
  } catch (err) {
    console.error('Error in direct delete:', err);
    res.status(500).json({ success: false, message: 'Error in direct delete endpoint' });
  }
});

router.options('/entry/:id', (req, res) => {
  res.status(200).send('DELETE endpoint for journal entries is registered');
});

module.exports = router;