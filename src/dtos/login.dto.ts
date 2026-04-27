import { Trim } from 'class-sanitizer';
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength
} from 'class-validator';

export class LoginDTO {
	@IsEmail({}, { message: 'Invalid email format' })
	@Trim()
	@IsNotEmpty()
	email!: string;

	// OPTIONAL password
	@IsOptional()
	@IsString()
	@Trim()
	@MinLength(6)
	password?: string;

	// OPTIONAL fingerprint login alternative
	@IsOptional()
	@IsString()
	@Trim()
	fingerprint?: string;

	@IsString()
	@Trim()
	@IsOptional()
	androidId?: string;
}