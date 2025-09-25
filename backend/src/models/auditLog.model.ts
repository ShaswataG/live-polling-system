import type { Types } from 'mongoose';
const mongoose = require('mongoose');
const { Schema, Document, Types: { ObjectId } } = require('mongoose');

interface IAuditLog extends Document {
    pollId?: Types.ObjectId;
    actorType: 'teacher' | 'system' | 'student';
    actorId?: Types.ObjectId | string;
    action: string; // e.g., 'create_poll', 'start_question', 'kick_student'
    payload?: Record<string, any>;
    createdAt: Date;
}


const AuditLogSchema = new Schema(
    {
        pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: false, index: true },
        actorType: { type: String, enum: ['teacher', 'system', 'student'], required: true },
        actorId: { type: Schema.Types.Mixed, required: false },
        action: { type: String, required: true },
        payload: { type: Schema.Types.Mixed, required: false },
        createdAt: { type: Date, default: () => new Date(), index: true }
    },
    { timestamps: false }
);


AuditLogSchema.index({ pollId: 1, createdAt: -1 });

export type { IAuditLog };
module.exports = mongoose.model('AuditLog', AuditLogSchema);