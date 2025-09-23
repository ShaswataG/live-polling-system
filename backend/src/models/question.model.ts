import type { Types } from 'mongoose';
const mongoose = require('mongoose');
const { Schema } = require('mongoose');
export type OptionItem = { optionId: string; text: string };


interface IQuestion extends Document {
    pollId: Types.ObjectId;
    text: string;
    options: OptionItem[];
    timeLimit: number; // seconds
    createdAt: Date;
    startedAt?: Date | null;
    endedAt?: Date | null;
    status: 'pending' | 'active' | 'ended';
}


const OptionSchema = new Schema({
optionId: { type: String, required: true },
text: { type: String, required: true }
}, { _id: false });


const QuestionSchema = new Schema(
    {
        pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true, index: true },
        text: { type: String, required: true },
        options: { type: [OptionSchema], validate: [(arr: OptionItem[]) => arr.length >= 2, 'At least 2 options required'] },
        timeLimit: { type: Number, default: 60 },
        startedAt: { type: Date, default: null },
        endedAt: { type: Date, default: null },
        status: { type: String, enum: ['pending', 'active', 'ended'], default: 'pending' }
    },
    { timestamps: true }
);


// find active question quickly by poll
QuestionSchema.index({ pollId: 1, status: 1 });

export type { IQuestion };
module.exports.QuestionModel = mongoose.model('Question', QuestionSchema);