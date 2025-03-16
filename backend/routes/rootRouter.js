const express = require('express');
const rootRouter = express.Router();
const { customerRouter } = require('./customerRoutes');
const { paymentRouter } = require('./paymentRouter');

rootRouter.use('/customer',customerRouter);
rootRouter.use('/', paymentRouter)

module.exports = {rootRouter}