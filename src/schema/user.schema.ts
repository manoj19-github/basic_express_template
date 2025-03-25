import { UserInterface } from '../interfaces/user.interface';
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type UserModelTypeAttributes = Optional<UserInterface, 'id'>;
export class UserModel extends Model<UserInterface, UserModelTypeAttributes> implements UserInterface {
	id!: number;
	email!: string;
	password!: string;
	address_id!: number;
	is_reset_password!: boolean;
	user_name!: string;
	termination_date?: Date | undefined;
	role_id!: number;
	is_email_verified!: boolean;
	is_enabled?: boolean | undefined;
	user_type!: string;
	is_super_admin: boolean | undefined;
	role_mapper_id!: number;
	is_registered!: boolean;
	created_at!: Date;
	updated_at?: Date | undefined;
	report_count?: number | undefined;
}

export default function (sequelize: Sequelize): typeof UserModel {
	UserModel.init(
		{
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER
			},
			email: {
				allowNull: false,
				type: DataTypes.STRING(56)
			},
			password: {
				allowNull: true,
				type: DataTypes.STRING(255)
			},
			user_name: {
				allowNull: false,
				type: DataTypes.STRING(255)
			},
			termination_date: {
				allowNull: true,
				type: DataTypes.DATE
			},
			role_id: {
				allowNull: false,
				type: DataTypes.INTEGER
			},
			address_id: {
				allowNull: false,
				type: DataTypes.INTEGER
			},
			phone_number: {
				allowNull: true,
				type: DataTypes.STRING(255)
			},
			is_email_verified: {
				allowNull: false,
				defaultValue: false,
				type: DataTypes.BOOLEAN
			},
			avatar: {
				allowNull: true,
				type: DataTypes.STRING(255)
			},
			is_enabled: {
				defaultValue: false,
				allowNull: false,
				type: DataTypes.BOOLEAN
			},
			user_type: {
				type: DataTypes.STRING(25),
				allowNull: false
			},
			is_super_admin: {
				defaultValue: false,
				allowNull: false,
				type: DataTypes.BOOLEAN
			},
			role_mapper_id: {
				allowNull: false,
				type: DataTypes.INTEGER
			},
			is_registered: {
				allowNull: false,
				defaultValue: false,
				type: DataTypes.BOOLEAN
			},
			report_count: {
				allowNull: true,
				defaultValue: 0,
				type: DataTypes.INTEGER
			},
			created_at: {
				type: DataTypes.DATE,
				defaultValue: Date.now()
			},

			updated_at: {
				type: DataTypes.DATE,
				allowNull: true
			}
		},
		{
			tableName: 'users',
			sequelize
		}
	);
	return UserModel;
}
