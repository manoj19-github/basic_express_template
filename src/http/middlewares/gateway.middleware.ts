import { config } from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { SERVICES } from '../../utils';
import { HttpException } from '../exceptions/http.exceptions';
config({ path: '.env.dev' });
const GatewayMiddleware = (req: Request, res: Response, next: NextFunction) => {
	console.log('====================================');
	console.log('hit gateway 9', req.headers);
	console.log('====================================');
	if (req.headers && req.headers?.jwtgatewaytoken) {
		const payload: any = JWT.verify(String(req.headers.jwtgatewaytoken), process.env.AUTH_SERVER_GATEWAY_SIGNATURE!);
		if (!!payload && SERVICES.includes(payload.id)) {
			const expiresDateTimeStamp = payload.expiresDateTimeStamp;
			if (
				expiresDateTimeStamp &&
				new Date().getTime() - new Date(expiresDateTimeStamp).getTime() <= 60 * 1000 &&
				payload.gatewayToken === process.env.KARYAM_GATEWAY_TOKEN
			) {
				console.log('====================================');
				console.log('success gateway 17');
				console.log('====================================');
				return next();
			}
			console.log('====================================');
			console.log('hit 18');
			console.log('====================================');
			throw new HttpException(400, 'API Gateway Error ');
		}
		throw new HttpException(400, 'API Gateway Error ');
	}
	throw new HttpException(400, 'API Gateway Error ');
};

export default GatewayMiddleware;
