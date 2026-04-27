import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith('Bearer ')) {
			return res.status(401).json({ success: false, message: 'Access token required' });
		}

		const token = authHeader.substring(7);
		const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access-secret');
		(req as any).user = decoded;
		next();
	} catch {
		return res.status(401).json({ success: false, message: 'Invalid or expired access token' });
	}
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
	if ((req as any).user.role !== 'admin') {
		return res.status(403).json({ success: false, message: 'Admin access required' });
	}
	next();
};