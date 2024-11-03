import { Schema, model } from 'mongoose';
import validator from 'validator';
import { IUserSchema } from './user.schema';

export enum OTPMasterEnum {
	userlogin = 'userlogin'
}

export interface IOTPSchema extends Document {
	type: OTPMasterEnum;
	genarateTime: Date;
	otpVal: string;
	userId: IUserSchema;
}
export const OTPMasterSchema: Schema<IOTPSchema> = new Schema(
	{
		type: {
			type: String,
			required: [true, 'Please provide a type'],
			default: OTPMasterEnum.userlogin
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Please provide a user id ']
		},
		otpVal: {
			type: String,
			required: [true, 'Please provide a otp '],
			validate: [validator.isMobilePhone, 'Please provide a valid phone number']
		},
		genarateTime: {
			type: Date,
			default: Date.now()
		}
	},
	{ timestamps: true }
);

const otpMasterModel = model('OtpMaster', OTPMasterSchema);
export default otpMasterModel;