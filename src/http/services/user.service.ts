import { ClientSession } from 'mongoose';
import UserModel, { IUser } from '../../schema/user.schema';
import { HttpException } from '../exceptions/http.exceptions';
import { Request } from 'express';
import { DeviceUtils } from '../../utils/device.util';
import AuthTokenModel from '../../schema/authToken.schema';
import { AuthUtils } from '../../utils/auth.util';
import { RequestWithUser } from '@/interfaces/auth.interface';
import e from 'cors';

class UserAuthService {
	static async loginUser({ request, session }: { request: Request; session: ClientSession }): Promise<any> {
		const { email, password } = request.body;
		const clientDeviceId = request.get("Device-Id");
		const deviceInfo = DeviceUtils.getDeviceInfo(request);
		const deviceId = clientDeviceId || DeviceUtils.generateDeviceId(request);
		const existingUser = await UserModel.findByCredentials(email, password, session);
		if (!existingUser) throw new HttpException(400, 'this email or password is incorrect');
		const isAlreadyLoggedIn = await AuthTokenModel.isUserLoggedInOnAnotherDevice(existingUser._id, deviceId);
		if (isAlreadyLoggedIn) throw new HttpException(400, 'this email is already logged in on another device');
		const tokenPayload = {
			userId: existingUser._id,
			deviceId,
			email: existingUser.email
		};
		const accessToken = AuthUtils.generateAccessToken({ ...tokenPayload, expires: AuthUtils.JWT_ACCESS_TOKEN_EXPIRES });
		const refreshToken = AuthUtils.generateRefreshToken({ ...tokenPayload, expires: AuthUtils.JWT_REFRESH_TOKEN_EXPIRES });
		await AuthTokenModel.createAuthToken(
			{
				userId: existingUser._id,
				accessAuthToken: accessToken,
				refreshAuthToken: refreshToken,
				deviceId,
				deviceInfo
			},
			session
		);
		await session.commitTransaction();

		return {
			user: existingUser.toJSON(),
			deviceId,
			accessToken,
			refreshToken,
			tokens: {
				accessToken,
				refreshToken,
				accessTokenExpires: AuthUtils.JWT_ACCESS_TOKEN_EXPIRES,
				refreshTokenExpires: AuthUtils.JWT_REFRESH_TOKEN_EXPIRES
			}
		};
	}

	static async registerUser({ request, session }: { request: Request; session: ClientSession }): Promise<any> {
		const { name, email, password } = request.body;
		const clientDeviceId = request.get("Device-Id");
		const deviceInfo = DeviceUtils.getDeviceInfo(request);
		const deviceId = clientDeviceId || DeviceUtils.generateDeviceId(request);

		const existingUser = await UserModel.findByEmail(email, session);
		if (existingUser) throw new HttpException(400, 'this email already registered');
		const newUser: any = await UserModel.createUser({ name, email, password }, session);
		const tokenPayload = {
			userId: newUser._id,
			deviceId,
			email: newUser.email
		};
		const accessToken = AuthUtils.generateAccessToken({ ...tokenPayload, expires: AuthUtils.JWT_ACCESS_TOKEN_EXPIRES });
		const refreshToken = AuthUtils.generateRefreshToken({ ...tokenPayload, expires: AuthUtils.JWT_REFRESH_TOKEN_EXPIRES });
		await AuthTokenModel.deactivateAllUserAuthTokens(newUser._id, session);
		await AuthTokenModel.createAuthToken(
			{
				userId: newUser._id,
				accessAuthToken: accessToken,
				refreshAuthToken: refreshToken,
				deviceId,
				deviceInfo
			},
			session
		);
		await session.commitTransaction();

		return {
			user: newUser.toJSON(),
			deviceId,
			accessToken,
			refreshToken,
			tokens: {
				accessToken,
				refreshToken,
				accessTokenExpires: AuthUtils.JWT_ACCESS_TOKEN_EXPIRES,
				refreshTokenExpires: AuthUtils.JWT_REFRESH_TOKEN_EXPIRES
			}
		};
	}
	static async refreshToken({ request, session }: { request: Request; session: ClientSession }): Promise<any> {
		 const clientRefreshToken =  request?.get('Refresh-Token') || "";
		const clientDeviceId = request.get("Device-Id");
		const userAgent = request.get('User-Agent') || 'Unknown';
		const ipAddress = request.ip || 'Unknown';
		if (!clientRefreshToken) throw new HttpException(400, 'refresh token is required');
		const decoded = AuthUtils.verifyRefreshToken(clientRefreshToken);
		const deviceId = clientDeviceId || DeviceUtils.generateDeviceId(request);
		const tokenRecord = await AuthTokenModel.findByRefreshAuthToken(decoded.userId);
		if (!tokenRecord) throw new HttpException(400, 'this refresh token is invalid');
		if (tokenRecord.deviceId !== deviceId) throw new HttpException(400, 'this refresh token is invalid');
		const existingUser = await UserModel.findById(tokenRecord.userId).session(session);
		if (!existingUser) throw new HttpException(400, 'this refresh token is invalid | or User not found');
		const tokenPayload = {
			userId: existingUser._id,
			deviceId,
			email: existingUser.email
		};
		const accessToken = AuthUtils.generateAccessToken({ ...tokenPayload, expires: AuthUtils.JWT_ACCESS_TOKEN_EXPIRES });
		const refreshToken = AuthUtils.generateRefreshToken({ ...tokenPayload, expires: AuthUtils.JWT_REFRESH_TOKEN_EXPIRES });
		await AuthTokenModel.deactivateAuthToken(tokenRecord._id, session);
		await AuthTokenModel.createAuthToken(
			{
				userId: existingUser._id,
				accessAuthToken: accessToken,
				refreshAuthToken: refreshToken,
				deviceId,
				deviceInfo: {
					userAgent,
					ipAddress,
					acceptLanguage: request.get('Accept-Language') || 'Unknown',
					platform: request.get('User-Agent') || 'Unknown'
				}
			},
			session
		);
		await session.commitTransaction();

		return {
			user: existingUser.toJSON(),
			deviceId,
			accessToken,
			refreshToken,
			tokens: {
				accessToken,
				refreshToken,
				accessTokenExpires: AuthUtils.JWT_ACCESS_TOKEN_EXPIRES,
				refreshTokenExpires: AuthUtils.JWT_REFRESH_TOKEN_EXPIRES
			}
		};
	}
	static async logoutUser({ request, session }: { request: Request; session: ClientSession }): Promise<any> {
		const userId = request?.user?._id
		const clientDeviceId = request.get("Device-Id");
		if (!userId || !clientDeviceId) throw new HttpException(400, 'userId or deviceId is required');
		await AuthTokenModel.updateMany({ userId, deviceId: clientDeviceId, isActive: true }, { isLoggedIn: false }).session(session);
		await session.commitTransaction();
		return {
			success: true,
			message: 'User logged out successfully'
		};
	}

	static async refreshTokenWithOutSession({
		tokenPayload,
		request
	}: {
		request: Request;
		tokenPayload: { userId: any; deviceId: any; email: any };
	}): Promise<{
		user: any;
		deviceId: string;
		accessToken: string;
		refreshToken: string;
		tokens: {
			accessToken: string;
			refreshToken: string;
			accessTokenExpires: any;
			refreshTokenExpires: any;
		};
	}> {
		const { userId, deviceId, email } = tokenPayload;
		const userAgent = request.get('User-Agent') || 'Unknown';
		const ipAddress = request.ip || 'Unknown';
		const newDeviceId = deviceId || DeviceUtils.generateDeviceId(request);
		const tokenRecord = await AuthTokenModel.findByRefreshAuthToken(userId);
		const isUserExists = await UserModel.findById(userId);
		if (!isUserExists) throw new HttpException(400, 'Refresh token is invalid');
		if (!tokenRecord) throw new HttpException(400, 'this refresh token is invalid');
		if (tokenRecord.deviceId !== deviceId) throw new HttpException(400, 'this refresh token is invalid');

		const accessToken = AuthUtils.generateAccessToken({ ...tokenPayload, expires: AuthUtils.JWT_ACCESS_TOKEN_EXPIRES });
		const refreshToken = AuthUtils.generateRefreshToken({ ...tokenPayload, expires: AuthUtils.JWT_REFRESH_TOKEN_EXPIRES });
		await AuthTokenModel.deactivateAuthToken(tokenRecord._id);
		await AuthTokenModel.createAuthToken({
			userId,
			accessAuthToken: accessToken,
			refreshAuthToken: refreshToken,
			deviceId: newDeviceId,
			deviceInfo: {
				userAgent,
				ipAddress,
				acceptLanguage: request.get('Accept-Language') || 'Unknown',
				platform: request.get('User-Agent') || 'Unknown'
			}
		});

		return {
			user: isUserExists.toJSON(),
			deviceId,
			accessToken,
			refreshToken,
			tokens: {
				accessToken,
				refreshToken,
				accessTokenExpires: AuthUtils.JWT_ACCESS_TOKEN_EXPIRES,
				refreshTokenExpires: AuthUtils.JWT_REFRESH_TOKEN_EXPIRES
			}
		};
	}
}

export default UserAuthService;
