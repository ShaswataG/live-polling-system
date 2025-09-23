import type { Types } from 'mongoose';
const mongoose = require("mongoose");
const { Schema } = require("mongoose");
mongoose.Types.ObjectId;

type ObjectId = Types.ObjectId;

interface IPoll extends Document {
    pollId: string; // human friendly id used in URLs
    title: string;
    teacherId?: ObjectId;
    status: 'draft' | 'active' | 'closed';
    config: {
    defaultTimeLimit: number; // seconds
    allowMultipleQuestions?: boolean;
    maxStudents?: number;
    };
    currentQuestionId?: ObjectId | null;
    questions: ObjectId[]; // refs to Question
    createdAt: Date;
    updatedAt: Date;
}

const PollSchema = new Schema(
    {
        pollId: { type: String, required: true, unique: true, index: true },
        title: { type: String, required: true },
        teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
        config: {
        defaultTimeLimit: { type: Number, default: 60 },
        allowMultipleQuestions: { type: Boolean, default: false },
        maxStudents: { type: Number, default: 0 }
        },
        currentQuestionId: { type: Schema.Types.ObjectId, ref: 'Question', default: null },
        questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }]
    },
    { timestamps: true }
);



PollSchema.index({ teacherId: 1, createdAt: -1 });

export type { IPoll };
module.exports.PollModel = mongoose.model('Poll', PollSchema);