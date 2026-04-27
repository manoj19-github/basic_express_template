
import { startSession } from "../../config/dbConfig";
import { MatchModel } from "../../models/match.schema";
import { getMatchStatus } from "../../utils";

import { NextFunction, Request, Response } from "express";

export class MatchController {
	static async createMatchController(req: Request, res: Response, next: NextFunction) {
		const session = await startSession();
		try {
			session.startTransaction();
			const newMatchData = await MatchModel.create([
				{
					sport: req.body.sport,
					homeTeam: req.body.homeTeam,
					awayTeam: req.body.awayTeam,
					startTime: new Date(req.body.startTime),
					endTime: new Date(req.body.endTime),
					homeScore: req.body.homeScore,
					awayScore: req.body.awayScore,
					status: getMatchStatus(req.body.startTime, req.body.endTime),
				},
			], { session });

			await session.commitTransaction();
			session.endSession();
			res.status(201).json({
				success: true,
				message: 'Match created successfully',
				data: newMatchData
			});

		} catch (error) {
			await session.abortTransaction();
			session.endSession();
			console.log('error: ', error);
			next(error);
		}

	}
}