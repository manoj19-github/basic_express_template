import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';
import { UserController } from '../http/controllers/user.controller';
import DTOValidationMiddleware from '../http/middlewares/apiValidator.middleware';
import { RegistrationDTO } from '../dtos/registration.dto';
import { AuthMiddleware } from '../http/middlewares/auth.middleware';
import { LoginDTO } from '../dtos/login.dto';
export class UserRoute implements Routes {
	path?: string | undefined;
	router: Router;
	constructor() {
		this.router = Router();
		this.path = `/auth`;
		this.initializeRoutes();
	}
	private initializeRoutes(): void {
		this.router.post(`${this.path}/signup`, DTOValidationMiddleware(RegistrationDTO), UserController.registerUser);
		this.router.post(`${this.path}/login`, DTOValidationMiddleware(LoginDTO), UserController.loginUser);
		this.router.get(`${this.path}/refresh-token`, UserController.refreshToken);
		this.router.post(`${this.path}/logout`, AuthMiddleware, UserController.logoutUser);
	}
}
