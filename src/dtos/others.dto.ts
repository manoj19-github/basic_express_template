import { IsCustomEmail } from "../utils";

export class EmailValidatorDTO  {
	@IsCustomEmail({ message: 'Provided Email is not valid' })
	email!:string;

}