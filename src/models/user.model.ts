import { DataTypes } from 'sequelize';
import { sequelize } from '../config/dbConfig';

export const User = sequelize.define('User', {
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	fullName: { type: DataTypes.STRING(150), allowNull: false, field: 'full_name' },
	email: { type: DataTypes.STRING(150), unique: true, allowNull: false },
	password: { type: DataTypes.TEXT, allowNull: false },
	role: { type: DataTypes.ENUM('admin', 'employee'), allowNull: false }
}, {
	tableName: 'users',
	timestamps: true,
	createdAt: 'created_at',
	updatedAt: false
});