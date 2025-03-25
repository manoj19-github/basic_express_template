import { OTPInterface, OTPStatusEnum, OTPTypeEnum } from '../interfaces/otp.interface';

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type OTPMasterAttributes = Optional<OTPInterface, 'id'>;
export class OTPModel extends Model<OTPInterface, OTPMasterAttributes> implements OTPInterface {
	id!: number;
	email!: string;
	otp_expiry_time!: Date;
	otp_generation_time!: Date;
	otp_status!: OTPStatusEnum;
	otp_type!: OTPTypeEnum;
	otp_value!: string;
	phone?: string | undefined;
	created_at!: Date;
	updated_at?: Date | undefined;
	user_id!: number;
}

export default function (sequelize: Sequelize): typeof OTPModel {
	OTPModel.init(
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
			otp_expiry_time: {
				type: DataTypes.DATE,
				allowNull: false
			},
			otp_generation_time: {
				type: DataTypes.DATE,
				allowNull: false
			},
			otp_status: {
				type: DataTypes.ENUM('USED', 'EXPIRES', 'UNUSED'),
				allowNull: false
			},
			otp_type: {
				type: DataTypes.ENUM('LOGINTYPE'),
				allowNull: false
			},
			otp_value: {
				type: DataTypes.STRING,
				allowNull: false
			},
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			created_at: {
				type: DataTypes.DATE,
				allowNull: false
			},
			updated_at: {
				type: DataTypes.DATE,
				allowNull: true
			}
		},

		{
			tableName: 'otp_table',
			sequelize
		}
	);
	return OTPModel;
}
