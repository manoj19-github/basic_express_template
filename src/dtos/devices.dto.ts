import { Trim } from 'class-sanitizer';
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength
} from 'class-validator';

export class DeviceRegisterDTO {
	@IsString()
	@Trim()
	@IsNotEmpty({ message: 'androidId is required' })
	androidId!: string;

	@IsString()
	@Trim()
	@IsNotEmpty({ message: 'deviceModel is required' })
	deviceModel!: string;

	@IsString()
	@Trim()
	@IsNotEmpty({ message: 'osVersion is required' })
	osVersion!: string;

	@IsOptional()
	@IsString()
	@Trim()
	@MinLength(10, { message: 'fingerprint too short' })
	@MaxLength(500, { message: 'fingerprint too long' })
	fingerprint?: string;
}