const Joi = require('joi');

/**
 * Validation Middleware
 * Validates request data using Joi schemas
 */

/**
 * Generic validation middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    req.validatedBody = value;
    next();
  };
};

/**
 * Validation Schemas
 */

// User Registration
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .min(6)
    .required(),
  displayName: Joi.string()
    .max(50)
    .optional(),
});

// User Login
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .required(),
});

// Reading Creation
const createReadingSchema = Joi.object({
  spread: Joi.string()
    .hex()
    .length(24)
    .required(),
  question: Joi.string()
    .max(500)
    .required(),
  category: Joi.string()
    .valid('general', 'love', 'career', 'spiritual', 'decision')
    .optional(),
  isPublic: Joi.boolean()
    .optional(),
  notes: Joi.string()
    .max(1000)
    .optional(),
  tags: Joi.array()
    .items(Joi.string())
    .optional(),
});

// Spread Creation
const createSpreadSchema = Joi.object({
  name: Joi.string()
    .required(),
  nameKo: Joi.string()
    .required(),
  description: Joi.string()
    .required(),
  cardCount: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required(),
  positions: Joi.array()
    .items(
      Joi.object({
        position: Joi.number().integer().required(),
        name: Joi.string().required(),
        nameKo: Joi.string().required(),
        meaning: Joi.string().required(),
      })
    )
    .required(),
  difficulty: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .optional(),
  category: Joi.string()
    .valid('general', 'love', 'career', 'spiritual', 'decision')
    .optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createReadingSchema,
  createSpreadSchema,
};
