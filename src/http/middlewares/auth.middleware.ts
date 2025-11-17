// middleware/auth.middleware.ts
import AuthTokenModel from '../../schema/authToken.schema';
import UserModel, { IUser } from '../../schema/user.schema';
import { Response, Request, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { AuthJWTPayload, RequestWithUser } from '../../interfaces/auth.interface';
import { HttpException } from '../exceptions/http.exceptions';
import { AuthUtils } from '../../utils/auth.util';
import UserAuthService from '../services/user.service';
import { CookieUtils } from '../../utils/cookie.utils';

export const AuthMiddleware = () => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Check Authorization header
			const headers = req.headers as Record<string, any>;
			const authHeader = headers.authorization as string;
			const tokenDetails = CookieUtils.getTokenFromCookies(req as any);
			if ((!tokenDetails.accessToken && !tokenDetails.refreshToken) || !authHeader || !authHeader.startsWith('Bearer ')) {
				throw new HttpException(401, 'Authorization header or cookies required');
			}

			const accessToken = authHeader.split(' ')?.[1] || tokenDetails?.accessToken || '';

			// Step 1: JWT verification
			let decoded: any;
			try {
				decoded = JWT.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as any;
			} catch (jwtError: any) {
				if (jwtError.name === 'TokenExpiredError') {
					// ALWAYS check expired tokens in database (they might be manually revoked)
					await handleTokenRefresh({ request: req as any, response: res, next, expiredAccessToken: accessToken });
				}
				throw new HttpException(403, 'Invalid token');
			}

			// Step 2: Get user data
			await proceedWithUserLookup(decoded, req, next);
		} catch (error: any) {
			handleAuthError(error, res);
		}
	};
};

async function proceedWithUserLookup(decoded: AuthJWTPayload, req: Request, next: NextFunction) {
	const user = await UserModel.findById(decoded.userId);
	if (!user) {
		throw new HttpException(400, 'User not found');
	}

	req.user = user as unknown as IUser;
	(req as any).deviceId = decoded.deviceId;
	(req as any).userId = decoded.userId;

	next();
}

function handleAuthError(error: any, res: Response) {
	if (error instanceof HttpException) {
		return res.status(error.status).json({
			success: false,
			message: error.message
		});
	}

	if (error.name === 'TokenExpiredError') {
		return res.status(403).json({
			success: false,
			message: 'Token expired'
		});
	}

	if (error.name === 'JsonWebTokenError') {
		return res.status(403).json({
			success: false,
			message: 'Invalid token'
		});
	}

	console.error('Auth middleware error:', error);
	return res.status(500).json({
		success: false,
		message: 'Internal server error'
	});
}

const handleTokenRefresh = async ({
	request,
	response,
	next
}: {
	request: RequestWithUser;
	response: Response;
	next: NextFunction;
	expiredAccessToken: string;
}) => {
	try {
		const refreshToken = CookieUtils.getTokenFromCookies(request as any).refreshToken;
		if (!refreshToken) throw new HttpException(400, 'Refresh token is required');
		let decodedRefreshToken: any;
		try {
			decodedRefreshToken = AuthUtils.verifyRefreshToken(refreshToken);
		} catch (error) {
			CookieUtils.clearAuthCookies(response);
			throw new HttpException(400, 'Invalid refresh token');
		}

		const tokenDetails = await AuthTokenModel.findByRefreshAuthToken(refreshToken);
		if (!tokenDetails) {
			throw new HttpException(400, 'Refresh token is invalid');
		}
		if (tokenDetails.deviceId !== decodedRefreshToken.deviceId) {
			throw new HttpException(403, 'Refresh token is invalid');
		}
		if (AuthUtils.isTokenExpired(decodedRefreshToken)) {
			CookieUtils.clearAuthCookies(response);
			throw new HttpException(403, 'Refresh token is invalid');
		}
		const tokenPayload = {
			userId: decodedRefreshToken.userId,
			deviceId: decodedRefreshToken.deviceId,
			email: decodedRefreshToken.email
		};
		const _result = await UserAuthService.refreshTokenWithOutSession({ tokenPayload, request: request as any });
		if (!_result) {
			throw new HttpException(400, 'Refresh token is invalid');
		}
		CookieUtils.setAuthCookies(response as any, {
			accessToken: _result.accessToken,
			refreshToken: _result.refreshToken,
			deviceId: _result.deviceId,
			refreshTokenExpires: _result.tokens.refreshTokenExpires,
			accessTokenExpires: _result.tokens.accessTokenExpires
		});
		next();
	} catch (error) {
		handleAuthError(error, response);
	}
};
