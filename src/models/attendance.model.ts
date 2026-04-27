import { DataTypes } from 'sequelize';
import { sequelize } from '../config/dbConfig';

export const Attendance = sequelize.define('Attendance', {
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
	eventDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'event_date' },
	eventType: { type: DataTypes.ENUM('checkin', 'checkout'), field: 'event_type' },
	timestampEvent: { type: DataTypes.DATE, field: 'timestamp_event' }
}, {
	tableName: 'attendance',
	timestamps: true,
	createdAt: 'created_at',
	updatedAt: false,
	indexes: [
		{ fields: ['user_id', 'event_date'] },
		{ fields: ['event_type'] }
	]
});