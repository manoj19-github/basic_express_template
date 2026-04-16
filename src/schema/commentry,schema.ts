import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICommentary extends Document {
	matchId: Types.ObjectId;
	minute: number;
	sequence: number;
	period?: string;
	eventType: string;
	actor?: string;
	team?: string;
	message: string;
	metadata?: Record<string, any>;
	tags: string[];
	createdAt: Date;
}

const CommentarySchema = new Schema<ICommentary>(
	{
		matchId: {
			type: Schema.Types.ObjectId,
			ref: 'Match',
			required: true,
			index: true,
		},
		minute: {
			type: Number,
			required: true,
		},
		sequence: {
			type: Number,
			required: true,
		},
		period: {
			type: String,
		},
		eventType: {
			type: String,
			required: true,
		},
		actor: {
			type: String,
		},
		team: {
			type: String,
		},
		message: {
			type: String,
			required: true,
		},
		metadata: {
			type: Schema.Types.Mixed, // flexible JSON
		},
		tags: {
			type: [String],
			default: [],
		},
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: false },
	}
);

// 🔥 Compound index for real-time ordering
CommentarySchema.index({ matchId: 1, sequence: 1 });

export const CommentaryModel = mongoose.model<ICommentary>(
	'Commentary',
	CommentarySchema
);