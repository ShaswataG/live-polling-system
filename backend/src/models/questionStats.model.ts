import type { Types } from 'mongoose';
const mongoose = require('mongoose');
const { Schema, Document, Types: { ObjectId } } = require('mongoose');

interface IQuestionStats extends Document {
    pollId: Types.ObjectId;
    questionId: Types.ObjectId;
    counts: Map<string, number>; // optionId -> count
    total: number;
    lastUpdatedAt: Date;
}


const QuestionStatsSchema = new Schema(
    {
        pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true, index: true },
        questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true, unique: true, index: true },
        counts: { type: Map, of: Number, default: {} },
        total: { type: Number, default: 0 },
        lastUpdatedAt: { type: Date, default: () => new Date() }
    },
    { timestamps: false }
);


QuestionStatsSchema.index({ questionId: 1 }, { unique: true });
QuestionStatsSchema.index({ pollId: 1 });

export type { IQuestionStats };
module.exports = mongoose.model('QuestionStats', QuestionStatsSchema);