import { Trim } from 'class-sanitizer';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsCustomEmail } from '../utils';
export class GenerateOTPForLogin {
	@IsCustomEmail({ message: 'Provided Email is not valid' })
	@IsNotEmpty()
	@Trim()
	email: string | undefined;
}

export class GenerateOTPForRegistration {
	@IsCustomEmail({ message: 'Provided Email is not valid' })
	@IsNotEmpty()
	@Trim()
	email: string | undefined;
}

export class VerifyOTPForLogin {
	@IsCustomEmail({ message: 'Provided Email is not valid' })
	@IsNotEmpty()
	@Trim()
	email: string | undefined;
	@IsString()
	@IsNotEmpty()
	@Trim()
	otp: string | undefined;
}

export class VerifyOTPForRegistration {
	@IsCustomEmail({ message: 'Provided Email is not valid' })
	@IsNotEmpty()
	@Trim()
	email: string | undefined;
	@IsString()
	@IsNotEmpty()
	@Trim()
	otp: string | undefined;
}

export class SetNewPasswordDTO {
	@IsCustomEmail({ message: 'Provided Email is not valid' })
	@IsNotEmpty()
	@Trim()
	email: string | undefined;
	@IsString()
	@IsNotEmpty()
	@Trim()
	newPassword: string | undefined;
	@IsString()
	@IsNotEmpty()
	@Trim()
	confirmCode: string | undefined;
}


