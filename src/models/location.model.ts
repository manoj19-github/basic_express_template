import { DataTypes } from 'sequelize';
import { sequelize } from '../config/dbConfig';

export const Location = sequelize.define('Location', {
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
	latitude: { type: DataTypes.DOUBLE, allowNull: false },
	longitude: { type: DataTypes.DOUBLE, allowNull: false },
	isInside: { type: DataTypes.BOOLEAN, allowNull: false, field: 'is_inside' },
	distance: { type: DataTypes.DOUBLE },
	logType: { type: DataTypes.STRING(20), field: 'log_type' }, // checkin | distance | interval
	recordedAt: { type: DataTypes.DATE, allowNull: false, field: 'recorded_at' }
}, {
	tableName: 'locations',
	timestamps: true,
	createdAt: 'created_at',
	updatedAt: false
});