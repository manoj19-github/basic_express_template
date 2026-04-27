import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-min-32-chars!!';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-min-32-chars!!';

export const generateAccessToken = (payload: { userId: string; role: string }) =>
	jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });

export const generateRefreshToken = (payload: { userId: string }) =>
	jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

export const verifyRefreshToken = (token: string) => jwt.verify(token, REFRESH_SECRET);