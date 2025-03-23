const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Import schemas
require('./swaggerSchemas');

// Cấu hình Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'API Documentation for E-Commerce Application',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './routes/dashboard/*.js', './utiles/swaggerSchemas.js'], // Đường dẫn đến các file routes và schema
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerSpec: specs,
  swaggerUi: swaggerUi,
}; 