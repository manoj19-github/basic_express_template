import { Trim } from 'class-sanitizer';
import { IsEmail, IsNotEmpty } from 'class-validator';
export class GettingStartedDTO {
	@IsEmail({}, { message: 'Provided Email is not valid' })
	@IsNotEmpty()
	@Trim()
	email: string | undefined;
}
