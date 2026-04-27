import DTOValidationMiddleware from '@/http/middlewares/apiValidator.middleware';
import { Router } from 'express';
import { DeviceRegisterDTO } from '../dtos/devices.dto';
import { DeviceController } from '../http/controllers/device.controller';
import { authenticate } from '../http/middlewares/auth.middleware';
import { Routes } from '../interfaces/routes.interface';
export class AuthRoutes implements Routes {
	path?: string | undefined;
	router: Router;
	constructor() {
		this.router = Router();
		this.path = `/device`;
		this.initializeRoutes();
	}
	private initializeRoutes(): void {

		this.router.post(`${this.path}/register`, DTOValidationMiddleware(DeviceRegisterDTO), authenticate, DeviceController.registerDevice);
	}

}
