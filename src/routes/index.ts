import { Application } from 'express';
import { Routes } from '../interfaces/routes.interface';
import { MatchRoute } from './match.route';

class RoutesMain {
	private routes: Routes[] = [new MatchRoute()]; // add all routes  here
	constructor() { }
	public initializeAllRoutes(app: Application) {
		this.routes.forEach((route) => {
			app.use('/api/', route.router);
		});
	}
}

export default RoutesMain;
