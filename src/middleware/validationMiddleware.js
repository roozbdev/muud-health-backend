const Joi = require('joi');


const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }
    
    req.body = value;
    next();
  };
};

const journalEntrySchema = Joi.object({
  user_id: Joi.string().required(),
  entry_text: Joi.string().required(),
  mood_rating: Joi.number().integer().min(1).max(5).required(),
  timestamp: Joi.date().iso().default(new Date()),
});

const journalUpdateSchema = Joi.object({
  entry_text: Joi.string().required(),
  mood_rating: Joi.number().integer().min(1).max(5).required(),
});

const contactSchema = Joi.object({
  user_id: Joi.string().required(),
  contact_name: Joi.string().required(),
  contact_email: Joi.string().email().required(),
});

const contactUpdateSchema = Joi.object({
  contact_name: Joi.string().required(),
  contact_email: Joi.string().email().required(),
});

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

module.exports = {
  validate,
  journalEntrySchema,
  journalUpdateSchema,
  contactSchema,
  contactUpdateSchema,
  registerSchema,
  loginSchema
};