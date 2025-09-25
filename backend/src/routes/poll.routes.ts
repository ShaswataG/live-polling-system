// src/routes/poll.routes.ts
const express = require('express');
const router = express.Router();
const pollController = require('../controllers/poll.controller');

// Create a new poll
router.post('/', pollController.createPoll);

// Get all polls
router.get('/', pollController.getAllPolls);

// Get a single poll by ID
router.get('/:pollId', pollController.getPoll);

// Get poll results by ID
router.get('/:pollId/results', pollController.getPollResults);

// End a poll by ID
router.post('/:pollId/end', pollController.endPoll);

// Kick a user from a poll (removes session server-side)
router.post('/:pollId/kick', pollController.kickUser);

module.exports = router;