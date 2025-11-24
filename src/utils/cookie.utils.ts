import {Response, Request} from 'express';
import { AuthUtils } from './auth.util';
// utils/cookie.utils.ts
export interface CookieOptions {
	httpOnly: boolean;
	secure: boolean;
	sameSite: 'strict' | 'lax' | 'none';
	path: string;
	domain?: string;
	maxAge?: number;
	expires?: Date;
}

export class CookieUtils {
	static getCookieOptions(): CookieOptions {
		const isProduction = process.env.NODE_ENV === 'production';

		return {
			httpOnly: true, // Prevent XSS - JavaScript cannot access
			secure: isProduction, // Only send over HTTPS
			sameSite: 'strict', // CSRF protection
			path: '/', // Available across entire site
			domain: process.env.COOKIE_DOMAIN || undefined
		};
	}

	static setAuthCookies(
		response: Response,
		tokens: { accessToken: string; refreshToken: string; deviceId: string; refreshTokenExpires: string; accessTokenExpires: string }
	): void {
		const baseOptions = this.getCookieOptions();

		// Access Token Cookie - 1 hour
		response.cookie('access_token', tokens.accessToken, {
			...baseOptions,
			maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
			expires: new Date(Date.now() + 60 * 60 * 1000)
		});

		// Refresh Token Cookie - 7 days
		response.cookie('refresh_token', tokens.refreshToken, {
			...baseOptions,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
			expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
		});

		// Public cookie for token expiry info (client can read)
		response.cookie(
			'token_info',
			JSON.stringify({
				accessTokenExpires: AuthUtils.durationToUTC(tokens.accessTokenExpires),
				refreshTokenExpires: AuthUtils.durationToUTC(tokens.refreshTokenExpires)
			}),
			{
				...baseOptions,
				httpOnly: false, // Allow client-side access
				maxAge: 7 * 24 * 60 * 60 * 1000
			}
		);
		response.set('Access-Token', tokens.accessToken);
		response.set('Refresh-Token', tokens.refreshToken);
		response.set('Access-Token-Expiry-UTC', AuthUtils.durationToUTC(tokens.accessTokenExpires));
		response.set('Refresh-Token-Expiry-UTC', AuthUtils.durationToUTC(tokens.refreshTokenExpires));
		response.set('Device-Id', tokens.deviceId);
	}

	static clearAuthCookies(response: Response): void {
		const options = this.getCookieOptions();

		response.clearCookie('access_token', options);
		response.clearCookie('refresh_token', options);
		response.clearCookie('token_info', { ...options, httpOnly: false });
		response.set('Access-Token', '');
		response.set('Refresh-Token', '');
		response.set('Access-Token-Expiry-UTC', '');
		response.set('Refresh-Token-Expiry-UTC', '');
		response.set('Device-Id', '');
	}

	static getTokenFromCookies(request: Request): { accessToken?: string; refreshToken?: string } {
		return {
			accessToken: request.cookies?.access_token || request?.get('Access-Token'),
			refreshToken: request.cookies?.refresh_token || request?.get('Refresh-Token')
		};
	}
}