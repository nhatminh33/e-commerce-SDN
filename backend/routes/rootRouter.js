const express = require('express');
const rootRouter = express.Router();
const { customerRouter } = require('./customerRoutes');

rootRouter.use('/customer',customerRouter);

module.exports = {rootRouter}