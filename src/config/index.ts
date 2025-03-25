import mongoose from 'mongoose';
import 'colors';
import POSTGRESDB from './configPG';
import { logger } from '../utils/logger';

export class configMain {
	static connectDatabase() {
		POSTGRESDB.sequelize.sync({ logging: true }).then(() => {
			logger.info(`POSTGRES Database connected successfully `.bgGreen);
		});
	}
}
