import bcryptjs from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { SendMailOptions } from 'nodemailer';
import { QueryTypes } from 'sequelize';

import { OTPStatusEnum, OTPTypeEnum } from '../../interfaces/otp.interface';
import { UtilsMain } from '../../utils';
import { HttpException } from '../exceptions/http.exceptions';
import UserModel from '../../schema/user.schema';
import { startSession } from '../../config/dbConfig';
import { DeviceUtils } from '../../utils/device.util';
import UserAuthService from '../services/user.service';
import { RequestWithUser } from '../../interfaces/auth.interface';
import { CookieUtils } from '../../utils/cookie.utils';
export class UserController {
	static async registerUser(request: Request, response: Response, next: NextFunction) {
		const session = await startSession();
		try {
			await session.startTransaction();
			const _result = await UserAuthService.registerUser({ request, session });
			CookieUtils.setAuthCookies(response as any, {
				accessToken: _result.accessToken,
				refreshToken: _result.refreshToken,
				deviceId: _result.deviceId,
				refreshTokenExpires: _result.tokens.refreshTokenExpires,
				accessTokenExpires: _result.tokens.accessTokenExpires
			});
			response.status(201).json({
				success: true,
				message: 'User registered successfully',
				data: _result
			});
		} catch (error) {
			if (session) await session.abortTransaction();
			next(error);
		} finally {
			await session.endSession();
		}
	}
	static async loginUser(req: Request, response: Response, next: NextFunction) {
		const session = await startSession();
		try {
			await session.startTransaction();
			const _result = await UserAuthService.loginUser({ request: req, session });
			CookieUtils.setAuthCookies(response as any, {
				accessToken: _result.accessToken,
				refreshToken: _result.refreshToken,
				deviceId: _result.deviceId,
				refreshTokenExpires: _result.tokens.refreshTokenExpires,
				accessTokenExpires: _result.tokens.accessTokenExpires
			});
			response.status(200).json({
				success: true,
				message: 'User logged in successfully',
				data: _result
			});
		} catch (error) {
			if (session) {
				await session.abortTransaction();
			}
			next(error);
		} finally {
			await session.endSession();
		}
	}
	static async refreshToken(req: Request, response: Response, next: NextFunction) {
		const session = await startSession();
		try {
			await session.startTransaction();
			const _result = await UserAuthService.refreshToken({ request: req, session });
			CookieUtils.setAuthCookies(response as any, {
				accessToken: _result.accessToken,
				refreshToken: _result.refreshToken,
				deviceId: _result.deviceId,
				refreshTokenExpires: _result.tokens.refreshTokenExpires,
				accessTokenExpires: _result.tokens.accessTokenExpires
			});
			response.status(200).json({
				success: true,
				message: 'Token refreshed successfully',
				data: _result
			});
		} catch (error) {
			if (session) {
				await session.abortTransaction();
			}
			next(error);
		} finally {
			await session.endSession();
		}
	}
	static async logoutUser(req: Request, response: Response, next: NextFunction) {
		const session = await startSession();
		try {
			await session.startTransaction();
			const _result = await UserAuthService.logoutUser({ request: req, session });
			CookieUtils.clearAuthCookies(response);
			response.status(200).json({
				success: true,
				message: 'Token refreshed successfully',
				data: _result
			});
		} catch (error) {
			if (session) {
				await session.abortTransaction();
			}
			next(error);
		} finally {
			await session.endSession();
		}
	}
}
