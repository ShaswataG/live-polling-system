import type { Types } from 'mongoose';
const mongoose = require('mongoose');
const { Schema, Document, Types: { ObjectId } } = require('mongoose');

interface ISession extends Document {
    clientId: string; // per-tab uuid
    displayName: string;
    pollId?: Types.ObjectId;
    socketId?: string;
    connectedAt: Date;
    lastSeenAt: Date;
}


const SessionSchema = new Schema(
    {
        clientId: { type: String, required: true, unique: true, index: true },
        displayName: { type: String, required: true },
        pollId: { type: mongoose.Types.ObjectId, ref: 'Poll', required: false },
        socketId: { type: String, required: false },
        connectedAt: { type: Date, default: () => new Date() },
        lastSeenAt: { type: Date, default: () => new Date(), index: true }
    },
    { timestamps: false }
);


// TTL: expire sessions after 24 hours of inactivity by default. Adjust as necessary.
SessionSchema.index({ lastSeenAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });


module.exports.SessionModel = mongoose.model('Session', SessionSchema);