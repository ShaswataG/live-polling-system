const express = require('express');
const pollRoutes = require('./poll.routes');

const router = express.Router();

router.use('/polls', pollRoutes);

module.exports = router;