import { DataTypes } from 'sequelize';
import { sequelize } from '../config/dbConfig';


export const Device = sequelize.define('Device', {
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	userId: { type: DataTypes.UUID, allowNull: false, unique: true, field: 'user_id' },
	androidId: { type: DataTypes.STRING(255), field: 'android_id' },
	deviceModel: { type: DataTypes.STRING(255), field: 'device_model' },
	osVersion: { type: DataTypes.STRING(100), field: 'os_version' },
	fingerprint: { type: DataTypes.TEXT }
}, {
	tableName: 'devices',
	timestamps: true,
	createdAt: 'created_at',
	updatedAt: false
});