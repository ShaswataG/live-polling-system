// src/controllers/poll.controller.ts
// REST controllers using PollService

import type e = require("express");

const PollService = require('../services/poll.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const createPoll = async (req: e.Request, res: e.Response, next: e.NextFunction) => {
  try {
    const { pollId, title, teacherId, config } = req.body;
    if (!pollId || !title) {
      return res.status(400).json(errorResponse('pollId and title are required', 400));
    }
    const poll = await PollService.createPoll({ pollId, title, teacherId, config });
    return res.json(successResponse(poll, 'Poll created'));
  } catch (err: any) {
    logger.error(`createPoll error: ${err.message}`);
    next(err);
  }
};

const getAllPolls = async (req: e.Request, res: e.Response, next: e.NextFunction) => {
  try {
    const polls = await PollService.getAllPolls();
    return res.json(successResponse(polls));
  } catch (err: any) {
    next(err);
  }
};

const getPoll = async (req: e.Request, res: e.Response, next: e.NextFunction) => {
  try {
    const { pollId } = req.params;
    const poll = await PollService.getPollByPollId(pollId);
    if (!poll) return res.status(404).json(errorResponse('Poll not found', 404));
    return res.json(successResponse(poll));
  } catch (err: any) {
    next(err);
  }
};

const getPollResults = async (req: e.Request, res: e.Response, next: e.NextFunction) => {
  try {
    const { pollId } = req.params;
    const stats = await PollService.getPollResults(pollId);
    return res.json(successResponse(stats));
  } catch (err: any) {
    next(err);
  }
};

const endPoll = async (req: e.Request, res: e.Response, next: e.NextFunction) => {
  try {
    const { pollId } = req.params;
    const poll = await PollService.endPoll(pollId);
    return res.json(successResponse(poll, 'Poll ended'));
  } catch (err: any) {
    next(err);
  }
};

const kickUser = async (req: e.Request, res: e.Response, next: e.NextFunction) => {
  try {
    const { pollId } = req.params;
    const { clientId } = req.body;
    if (!clientId) return res.status(400).json(errorResponse('clientId required', 400));
    // Remove session from DB; also emit via socket (socket layer handles broadcasting)
    await PollService.removeSessionByClientId(clientId);
    await PollService.getPollByPollId(pollId); // ensure poll exists
    // audit log
    return res.json(successResponse(null, 'Client kicked from poll (DB session removed). Socket layer will enforce actual disconnect.'));
  } catch (err: any) {
    next(err);
  }
};

module.exports = {
  createPoll,
  getAllPolls,
  getPoll,
  getPollResults,
  endPoll,
  kickUser,
};
