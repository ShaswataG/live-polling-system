import type { Types } from 'mongoose';
const mongoose = require('mongoose');
const { Schema, Document, Types: { ObjectId } } = require('mongoose');

interface IAnswer extends Document {
    pollId: Types.ObjectId;
    questionId: Types.ObjectId;
    clientId: string; // per-tab UUID stored in sessionStorage
    displayName: string;
    optionId: string;
    submittedAt: Date;
    meta?: { ip?: string; userAgent?: string };
}


const AnswerSchema = new Schema(
    {
        pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true, index: true },
        questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
        clientId: { type: String, required: true },
        displayName: { type: String, required: true },
        optionId: { type: String, required: true },
        submittedAt: { type: Date, default: () => new Date() },
        meta: {
            ip: { type: String, required: false },
            userAgent: { type: String, required: false }
        }
    },
    { timestamps: false }
);


// Prevent duplicate answers per question per client (one answer per student per question)
AnswerSchema.index({ questionId: 1, clientId: 1 }, { unique: true });
// Useful compound/aggregation indexes
AnswerSchema.index({ questionId: 1, optionId: 1 });
AnswerSchema.index({ pollId: 1, submittedAt: -1 });

export type { IAnswer };
module.exports.AnswerModel = mongoose.model('Answer', AnswerSchema);