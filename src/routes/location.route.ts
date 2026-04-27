import { Router } from 'express';
import { LocationController } from '../http/controllers/location.controller';
import { authenticate } from '../http/middlewares/auth.middleware';
import { Routes } from '../interfaces/routes.interface';
export class AuthRoutes implements Routes {
	path?: string | undefined;
	router: Router;
	constructor() {
		this.router = Router();
		this.path = `/location`;
		this.initializeRoutes();
	}
	private initializeRoutes(): void {

		this.router.post(`${this.path}/ping`, authenticate, LocationController.ping);

	}
}