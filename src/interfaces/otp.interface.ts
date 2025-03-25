export enum OTPTypeEnum {
	LOGINTYPE = 'LOGINTYPE',
	FORGOTPASSWORD = 'FORGOTPASSWORD',
	REGISTRATIONOTP = 'REGISTRATIONOTP'
}

export enum OTPStatusEnum{
	USED="USED",
	EXPIRES="EXPIRES",
	UNUSED="UNUSED"
}
export interface OTPInterface {
	id: number;
	email: string;
	otp_generation_time: Date;
	otp_expiry_time: Date;
	otp_type: OTPTypeEnum;
	otp_value: string;
	phone?: string;
	otp_status: OTPStatusEnum;
	created_at: Date;
	updated_at?: Date;
	user_id: number;
}