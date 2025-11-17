
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'santraNotesEmail', async: false })
export class santraNotesEmailConstraint implements ValidatorConstraintInterface {
  private emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

  validate(email: string, args: ValidationArguments): boolean {
    if (!email) return false;
    return this.emailRegex.test(email);
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Provided Email is not valid';
  }
}

export function IssantraNotesEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: santraNotesEmailConstraint,
    });
  };
}