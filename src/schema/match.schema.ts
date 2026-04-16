import mongoose, { Document, Schema } from 'mongoose';

export enum MatchStatus {
	SCHEDULED = 'scheduled',
	LIVE = 'live',
	FINISHED = 'finished',
}

export interface IMatch extends Document {
	sport: string;
	homeTeam: string;
	awayTeam: string;
	status: MatchStatus;
	startTime: Date;
	endTime?: Date;
	homeScore: number;
	awayScore: number;
	createdAt: Date;
}

const MatchSchema = new Schema<IMatch>(
	{
		sport: {
			type: String,
			required: true,
			trim: true,
		},
		homeTeam: {
			type: String,
			required: true,
			trim: true,
		},
		awayTeam: {
			type: String,
			required: true,
			trim: true,
		},
		status: {
			type: String,
			enum: Object.values(MatchStatus),
			default: MatchStatus.SCHEDULED,
		},
		startTime: {
			type: Date,
			required: true,
		},
		endTime: {
			type: Date,
		},
		homeScore: {
			type: Number,
			default: 0,
			min: 0,
		},
		awayScore: {
			type: Number,
			default: 0,
			min: 0,
		},
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: false },
	}
);

export const MatchModel = mongoose.model<IMatch>('Match', MatchSchema);