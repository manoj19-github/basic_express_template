import {
	IsDateString,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsPositive,
	IsString,
	Max,
	Min,
	Validate,
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

import { Transform } from 'class-transformer';

//////////////////////////////////////////////////////
// CONSTANTS
//////////////////////////////////////////////////////

export const MATCH_STATUS = {
	SCHEDULED: 'scheduled',
	LIVE: 'live',
	FINISHED: 'finished',
} as const;

//////////////////////////////////////////////////////
// CUSTOM VALIDATOR (superRefine equivalent)
//////////////////////////////////////////////////////

@ValidatorConstraint({ name: 'isEndTimeAfterStartTime', async: false })
class IsEndTimeAfterStartTimeConstraint
	implements ValidatorConstraintInterface {
	validate(_: any, args: ValidationArguments) {
		const obj = args.object as any;

		if (!obj.startTime || !obj.endTime) return true;

		const start = new Date(obj.startTime);
		const end = new Date(obj.endTime);

		return end > start;
	}

	defaultMessage() {
		return 'endTime must be after startTime';
	}
}

//////////////////////////////////////////////////////
// DTOs
//////////////////////////////////////////////////////

// ✅ listMatchesQuerySchema
export class ListMatchesQueryDto {
	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt()
	@IsPositive()
	@Max(100)
	limit?: number;
}

//////////////////////////////////////////////////////

// ✅ matchIdParamSchema
export class MatchIdParamDto {
	@Transform(({ value }) => Number(value))
	@IsInt()
	@IsPositive()
	id!: number;
}

//////////////////////////////////////////////////////

// ✅ createMatchSchema
export class CreateMatchDto {
	@IsString()
	@IsNotEmpty()
	sport!: string;

	@IsString()
	@IsNotEmpty()
	homeTeam!: string;

	@IsString()
	@IsNotEmpty()
	awayTeam!: string;

	@IsString()
	@IsDateString()
	startTime!: string;

	@IsString()
	@IsDateString()
	endTime!: string;

	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt()
	@Min(0)
	homeScore?: number;

	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt()
	@Min(0)
	awayScore?: number;

	// 🔥 superRefine equivalent
	@Validate(IsEndTimeAfterStartTimeConstraint)
	validateTimeOrder!: boolean;
}

//////////////////////////////////////////////////////

// ✅ updateScoreSchema
export class UpdateScoreDto {
	@Transform(({ value }) => Number(value))
	@IsInt()
	@Min(0)
	homeScore!: number;

	@Transform(({ value }) => Number(value))
	@IsInt()
	@Min(0)
	awayScore!: number;
}