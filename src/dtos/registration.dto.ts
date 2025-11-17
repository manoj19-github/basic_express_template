import { Trim } from 'class-sanitizer';
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { IssantraNotesEmail } from './customEmail.decorator';
export class RegistrationDTO {
	@IsString()
	@Trim()
	@IsNotEmpty()
	@MinLength(4, { message: 'Name should be minimum of 4 characters' })
	name: string | undefined;
	@IssantraNotesEmail()
	@IsNotEmpty()
	@Trim()
	email: string | undefined;
	@IsString()
	@Trim()
	@IsNotEmpty()
	@MinLength(6, { message: 'Password should be minimum of 6 characters' })
	password: string | undefined;
	@IsString()
	@IsOptional()
	@Trim()
	deviceId?: string | undefined;
}
