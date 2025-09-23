const express = require('express');
const router = express.Router();


router.post('/', (req: Request, res: Response) => {
    // Create a new poll
});

router.get('/', (req: Request, res: Response) => {
    // Get all polls
});

router.get('/:pollId', (req: Request, res: Response) => {
    // Get a single poll by ID
});

router.get('/:pollId/results', (req: Request, res: Response) => {
    // Get poll results by ID
});

router.post("/:pollId/end", (req: Request, res: Response) => {
    // End a poll by ID
});

router.post("/:pollId/kick", (req: Request, res: Response) => {
    // Kick a user from a poll
});

module.exports = router;