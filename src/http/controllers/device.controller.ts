import { NextFunction, Request, Response } from 'express';
import { DeviceService } from '../services/device.service';

export class DeviceController {
	static async registerDevice(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = (req as any).user.userId;
			const { androidId, deviceModel, osVersion, fingerprint } = req.body;

			if (!androidId || !deviceModel || !osVersion) {
				return res.status(400).json({
					success: false,
					message: 'androidId, deviceModel, osVersion, and fingerprint are required'
				});
			}

			const result = await DeviceService.registerDevice(
				userId, androidId, deviceModel, osVersion, fingerprint
			);

			return res.status(201).json({ success: true, message: result.message });
		} catch (error) {
			next(error);
		}
	}
}