const express = require('express');
const postosRouter = require('./postos');
const authRouter = require('./auth');
const usersRouter = require('./users');

const router = express.Router();

router.use('/postos', postosRouter);
router.use('/users', usersRouter);

module.exports = router;
