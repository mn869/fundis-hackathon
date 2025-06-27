const Joi = require('joi');

const schemas = {
  register: Joi.object({
    phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().optional(),
    role: Joi.string().valid('client', 'provider').default('client')
  }),

  login: Joi.object({
    phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    password: Joi.string().min(6).optional()
  }),

  createBooking: Joi.object({
    providerId: Joi.string().uuid().required(),
    serviceType: Joi.string().required(),
    description: Joi.string().min(10).max(1000).required(),
    scheduledDate: Joi.date().min('now').required(),
    duration: Joi.number().min(1).max(24).optional(),
    location: Joi.object({
      address: Joi.string().required(),
      latitude: Joi.number().optional(),
      longitude: Joi.number().optional()
    }).required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium')
  }),

  updateProvider: Joi.object({
    businessName: Joi.string().max(200).optional(),
    description: Joi.string().max(1000).optional(),
    services: Joi.array().items(Joi.string()).optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    experience: Joi.number().min(0).max(50).optional(),
    hourlyRate: Joi.number().min(0).optional(),
    availability: Joi.object().optional()
  }),

  createReview: Joi.object({
    bookingId: Joi.string().uuid().required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(500).optional()
  })
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schemas[schema].validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

module.exports = { validate, schemas };