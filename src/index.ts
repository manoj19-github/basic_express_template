import cors from 'cors';
import { config } from 'dotenv';
import express, { Application, Request, Response, json, urlencoded } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFound } from './http/middlewares/errorHandler.middleware';
import RoutesMain from './routes';
import { configMain } from './config';
class ExpressApp {
	private app: Application;
	private PORT: unknown;
	private routesMain = new RoutesMain();
	constructor() {
		config();
		this.app = express();
		this.PORT = process.env.PORT ?? 5000;
		this.middleware();
		this.routes();
	}
	private middleware(): void {
		this.app.use(cors({ credentials: true, origin: '*', methods: 'GET,POST,PUT,DELETE' }));
		this.app.use(urlencoded({ extended: true, limit: '50mb' }));
		this.app.use(json({ limit: '50mb' }));
		this.app.use(helmet());
		this.app.use(morgan('dev'));
	}
	private routes(): void {
		this.app.get('/', (req: Request, res: Response) => {
			return res.send('<h2>Server is running .....</h2>');
		});
		this.routesMain.initializeAllRoutes(this.app);

		// put this at the last of all routes

		this.app.use(errorHandler);
		this.app.use(notFound);
	}
	public listen(): void {
		// connectDB();

		this.app.listen(this.PORT, () => {
			configMain.connectDatabase();
			console.log(`Server is listening on  port : ${this.PORT}`);
		});
	}
}

const server = new ExpressApp();
server.listen();
