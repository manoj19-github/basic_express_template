import { Router } from 'express';
import { CreateMatchDto } from '../dtos/match.dto';
import { MatchController } from '../http/controllers/match.controller';
import DTOValidationMiddleware from '../http/middlewares/apiValidator.middleware';
import { Routes } from '../interfaces/routes.interface';
export class MatchRoute implements Routes {
	path?: string | undefined;
	router: Router;
	constructor() {
		this.router = Router();
		this.path = `/matches`;
		this.initializeRoutes();
	}
	private initializeRoutes(): void {
		this.router.post(`${this.path}/`, DTOValidationMiddleware(CreateMatchDto), MatchController.createMatchController);
	}

}
