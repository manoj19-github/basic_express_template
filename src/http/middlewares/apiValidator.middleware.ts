import { sanitize } from 'class-sanitizer';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions/http.exceptions';

const DTOValidationMiddleware =
	(type: any, skipMissingProperties: boolean = false) =>
		(req: Request, res: Response, next: NextFunction) => {

			const dtoObject = plainToInstance(type, req.body);

			validate(dtoObject, { skipMissingProperties })
				.then((errors: ValidationError[]) => {
					if (errors.length > 0) {
						return res.status(400).json({ message: errors });
					} else {
						sanitize(dtoObject);
						req.body = dtoObject;

						next();
					}
				})
				.catch((errors) => {

					return new HttpException(400, JSON.stringify(errors));
				});
		};
export default DTOValidationMiddleware;
