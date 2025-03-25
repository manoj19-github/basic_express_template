import bcryptjs from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { SendMailOptions } from 'nodemailer';
import { QueryTypes } from 'sequelize';
import POSTGRESDB from '../../config/configPG';
import { OTPStatusEnum, OTPTypeEnum } from '../../interfaces/otp.interface';
import { UtilsMain } from '../../utils';
import { HttpException } from '../exceptions/http.exceptions';
export class UserController {
	static async generateOTPForRegistration(req: Request, response: Response, next: NextFunction) {
		const transaction = await POSTGRESDB.sequelize.transaction();
		try {
			const { email } = req.body;
			const selectQuery = `select * from users where email = '${email}'`;
			const result: any[] = await POSTGRESDB.sequelize.query(selectQuery, { type: QueryTypes.SELECT, transaction });
			if (!result || result?.length === 0) throw new HttpException(400, 'User not found');
			const registrationOTP = UtilsMain.generateOTP();
			const mailOptions: SendMailOptions = UtilsMain.GetMailOptions({
				subject: `Dostbook OTP login`,
				to: result?.[0].email,
				expirationTime: 60,
				name: result?.[0].name,
				otp: registrationOTP
			});
			UtilsMain.sendMailMethod(mailOptions)
				.then(async (res) => {
					const insertQuery = `INSERT INTO otp_table (
						email,
						user_id,
						otp_generation_time,
						otp_expiry_time,
						otp_type,
						otp_status,
						otp_value,
						created_at
					) values(
						'${result?.[0].email}',
						${result?.[0].id},
						'${Date.now()}',
						'${Date.now() + 60 * 1000}',
						'${OTPTypeEnum.REGISTRATIONOTP}',
						'${OTPStatusEnum.UNUSED}',
						'${registrationOTP}',
						'${Date.now()}',
					)`;
					await POSTGRESDB.sequelize.query(insertQuery, {
						type: QueryTypes.INSERT,
						transaction
					});
				})
				.catch(() => {
					throw new HttpException(400, 'Something went wrong');
				});
			await transaction.commit();
			return response.status(200).json({ message: 'OTP sent successfully' });
		} catch (error) {
			console.log('error: ', error);
			if (transaction) transaction.rollback();
			next(error);
		}
	}
	static async generateOTPForLogin(req: Request, response: Response, next: NextFunction) {
		const transaction = await POSTGRESDB.sequelize.transaction();
		try {
			const { email } = req.body;
			const selectQuery = `select * from users where email = '${email}'`;
			const result: any[] = await POSTGRESDB.sequelize.query(selectQuery, { type: QueryTypes.SELECT, transaction });
			if (!result || result?.length === 0) throw new HttpException(400, 'User not found');
			const loginOTP = UtilsMain.generateOTP();
			const mailOptions: SendMailOptions = UtilsMain.GetMailOptions({
				subject: `Dostbook OTP login`,
				to: result?.[0].email,
				expirationTime: 60,
				name: result?.[0].name,
				otp: loginOTP
			});
			UtilsMain.sendMailMethod(mailOptions)
				.then(async (res) => {
					const insertQuery = `INSERT INTO otp_table (
						email,
						user_id,
						otp_generation_time,
						otp_expiry_time,
						otp_type,
						otp_status,
						otp_value,
						created_at
					) values(
						'${result?.[0].email}',
						${result?.[0].id},
						'${Date.now()}',
						'${Date.now() + 60 * 1000}',
						'${OTPTypeEnum.LOGINTYPE}',
						'${OTPStatusEnum.UNUSED}',
						'${loginOTP}',
						'${Date.now()}',
					)`;
					await POSTGRESDB.sequelize.query(insertQuery, {
						type: QueryTypes.INSERT,
						transaction
					});
				})
				.catch(() => {
					throw new HttpException(400, 'Something went wrong');
				});
			await transaction.commit();
			return response.status(200).json({ message: 'OTP sent successfully' });
		} catch (error) {
			console.log('error: ', error);
			if (transaction) transaction.rollback();
			next(error);
		}
	}
	static async VerifyOTPForLogin(req: Request, response: Response, next: NextFunction) {
		const transaction = await POSTGRESDB.sequelize.transaction();
		try {
			const { otp, email } = req.body;
			const selectQuery = `select * from users where email = '${email}'`;
			const existingUser: any[] = await POSTGRESDB.sequelize.query(selectQuery, { type: QueryTypes.SELECT, transaction });
			await transaction.commit();
			if (!existingUser || existingUser.length === 0) throw new HttpException(400, 'User not found');
			const selectOTPQuery = `
				SELECT * FROM otp_table where otp_value=:otp and email = :email
				and user_id = :userId and otp_status='${OTPStatusEnum.UNUSED}' and otp_type='${OTPTypeEnum.LOGINTYPE}'
				`;
			const otpDetails: any[] = await POSTGRESDB.sequelize.query(selectOTPQuery, {
				replacements: { otp, email, userId: existingUser?.[0].id },
				type: QueryTypes.SELECT,
				transaction
			});
			// const otpDetails = await otpMasterModel.findOne({ otpVal: otp, userId: isUserExists._id, type: OTPMasterEnum.userlogin });
			if (!otpDetails || otpDetails?.length === 0 || !otpDetails?.[0].otp_expiry_time) throw new HttpException(400, 'OTP not found');
			if (new Date(otpDetails?.[0].otp_expiry_time).getTime() - Date.now() > 60000) {
				const updateOTPQuery = `update otp_table set otp_status='${OTPStatusEnum.EXPIRES}' where otp_value=:otp and email = :email user_id = :userId  and otp_type='${OTPTypeEnum.LOGINTYPE}'`;
				await POSTGRESDB.sequelize.query(updateOTPQuery, {
					replacements: { otp, email, userId: existingUser?.[0].id },
					type: QueryTypes.UPDATE,
					transaction
				});
				await transaction.commit();
				return response.status(400).json({ message: 'OTP EXpires' });
			}
			const existsUserId = existingUser?.[0]?.id;
			const { accessToken, refreshToken } = UtilsMain.generateToken(existsUserId);
			const updateOTPQuery = `update otp_table set otp_status='${OTPStatusEnum.USED}' where otp_value=:otp and email = :email user_id = :userId  and otp_type='${OTPTypeEnum.LOGINTYPE}'`;
			await POSTGRESDB.sequelize.query(updateOTPQuery, {
				replacements: { otp, email, userId: existsUserId },
				type: QueryTypes.UPDATE,
				transaction
			});
			await transaction.commit();
			response.status(200).json({ accessToken, refreshToken, user: existsUserId });
		} catch (error) {
			if (transaction) transaction.rollback();
			next(error);
		}
	}
	static async VerifyOTPForForRegistration(req: Request, response: Response, next: NextFunction) {
		const transaction = await POSTGRESDB.sequelize.transaction();
		try {
			const { otp, email } = req.body;
			const selectQuery = `select * from users where email = '${email}'`;
			const existingUser: any[] = await POSTGRESDB.sequelize.query(selectQuery, { type: QueryTypes.SELECT, transaction });
			await transaction.commit();
			if (!existingUser || existingUser.length === 0) throw new HttpException(400, 'User not found');
			const selectOTPQuery = `
				SELECT * FROM otp_table where otp_value=:otp and email = :email
				and user_id = :userId and otp_status='${OTPStatusEnum.UNUSED}' and otp_type='${OTPTypeEnum.REGISTRATIONOTP}'
				`;
			const otpDetails: any[] = await POSTGRESDB.sequelize.query(selectOTPQuery, {
				replacements: { otp, email, userId: existingUser?.[0].id },
				type: QueryTypes.SELECT,
				transaction
			});
			// const otpDetails = await otpMasterModel.findOne({ otpVal: otp, userId: isUserExists._id, type: OTPMasterEnum.userlogin });
			if (!otpDetails || otpDetails?.length === 0 || !otpDetails?.[0].otp_expiry_time) throw new HttpException(400, 'OTP not found');
			if (new Date(otpDetails?.[0].otp_expiry_time).getTime() - Date.now() > 60000) {
				const updateOTPQuery = `update otp_table set otp_status='${OTPStatusEnum.EXPIRES}' where otp_value=:otp and email = :email user_id = :userId  and otp_type='${OTPTypeEnum.REGISTRATIONOTP}'`;
				await POSTGRESDB.sequelize.query(updateOTPQuery, {
					replacements: { otp, email, userId: existingUser?.[0].id },
					type: QueryTypes.UPDATE,
					transaction
				});
				await transaction.commit();
				return response.status(400).json({ message: 'OTP EXpires' });
			}
			const existsUserId = existingUser?.[0]?.id;
			const { accessToken, refreshToken } = UtilsMain.generateToken(existsUserId);
			const updateOTPQuery = `update otp_table set otp_status='${OTPStatusEnum.USED}' where otp_value=:otp and email = :email user_id = :userId  and otp_type='${OTPTypeEnum.REGISTRATIONOTP}'`;
			await POSTGRESDB.sequelize.query(updateOTPQuery, {
				replacements: { otp, email, userId: existsUserId },
				type: QueryTypes.UPDATE,
				transaction
			});
			await transaction.commit();
			response.status(200).json({ accessToken, refreshToken, user: existsUserId });
		} catch (error) {
			if (transaction) transaction.rollback();
			next(error);
		}
	}
	static async gettingStarted(req: Request, response: Response, next: NextFunction) {
		const transaction = await POSTGRESDB.sequelize.transaction();
		console.log('====================================');
		console.log('hit 111');
		console.log('====================================');
		try {
			const { email } = req.body;
			const selectUserQuery = `select * from users where email=:email`;
			const userExists: Array<any> = await POSTGRESDB.sequelize.query(selectUserQuery, {
				replacements: { email },
				type: QueryTypes.SELECT,
				transaction
			});

			await transaction.commit();

			// const isUserExists = await UserModel.findOne({ phoneNumber });
			if (!!userExists && Array.isArray(userExists) && userExists.length > 0)
				return response.status(200).json({ message: 'User already exists', navigateTo: 'LoginScreen' });
			return response.status(200).json({ message: `User does not exists`, navigateTo: 'RegisterScreen' });
		} catch (error) {
			if (transaction) transaction.rollback();
			next(error);
		}
	}

	static async registerHandler(req: Request, response: Response, next: NextFunction) {
		const transaction = await POSTGRESDB.sequelize.transaction();
		try {
			const { phoneNumber, name, email } = req.body;
			const selectUserQuery = `select * from users where email=:email`;
			const userExists: Array<any> = await POSTGRESDB.sequelize.query(selectUserQuery, {
				replacements: { email },
				type: QueryTypes.SELECT,
				transaction
			});

			if (userExists && Array.isArray(userExists) && userExists.length > 0) throw new HttpException(400, 'User already exists');
			const insertQuery = `INSERT INTO users(email,user_name,phone_number) values(:email,:userName,:phoneNumber)`;
			await POSTGRESDB.sequelize.query(insertQuery, {
				replacements: { email, userName: name, phoneNumber: phoneNumber ? phoneNumber : null },
				type: QueryTypes.INSERT,
				transaction
			});
			await transaction.commit();
			// await UserModel.create({ phoneNumber, name, email });
			response.status(200).json({ message: 'Congratulations! You have successfully registered.' });
		} catch (error) {
			if (transaction) transaction.rollback();
			next(error);
		}
	}

	static async getUserByPhoneNumber(req: Request, response: Response, next: NextFunction) {
		const transaction = await POSTGRESDB.sequelize.transaction();
		try {
			const { phoneNumber } = req.params;
			const selectUserQuery = `select * from users where phone_number=:phoneNumber`;
			const existingUser: Array<any> = await POSTGRESDB.sequelize.query(selectUserQuery, {
				replacements: { phoneNumber: phoneNumber ? phoneNumber : null },
				type: QueryTypes.SELECT,
				transaction
			});
			await transaction.commit();

			if (!existingUser || (Array.isArray(existingUser) && existingUser.length === 0)) throw new HttpException(400, 'User not found');
			response.status(200).json({ existingUser: existingUser?.[0] });
		} catch (error) {
			if (transaction) transaction.rollback();
			next(error);
		}
	}
	static async getUserById(req: Request, response: Response, next: NextFunction) {
		const transaction = await POSTGRESDB.sequelize.transaction();
		try {
			const { id } = req.params;
			const selectQuery = `SELECT * from users where id:=userId`;
			const existingUser: Array<any> = await POSTGRESDB.sequelize.query(selectQuery, {
				type: QueryTypes.SELECT,
				replacements: { userId: id },
				transaction
			});
			await transaction.commit();
			if (!existingUser || existingUser.length === 0) throw new HttpException(400, 'User not found');
			response.status(200).json({ existingUser: existingUser?.[0] });
		} catch (error) {
			if (transaction) transaction.rollback();
			next(error);
		}
	}
	static async reportFraud(req: Request, response: Response, next: NextFunction) {
		const transaction = await POSTGRESDB.sequelize.transaction();
		try {
			const { email } = req.params;
			const updateQuery = `update users set report_count=report_count+1  where email=:email returning * `;
			const existingUser: Array<any> = await POSTGRESDB.sequelize.query(updateQuery, {
				replacements: { email },
				type: QueryTypes.SELECT,
				transaction
			});
			await transaction.commit();
			// const user = await UserModel.findOne({ phoneNumber });
			if (!existingUser || existingUser.length === 0) throw new HttpException(400, 'User not found');
			response.status(200).json({ existingUser: existingUser?.[0] });
		} catch (error) {
			if (transaction) transaction.rollback();
			next(error);
		}
	}
	static async getFraudUsers(req: Request, response: Response, next: NextFunction) {
		const transaction = await POSTGRESDB.sequelize.transaction();
		try {
			const selectQuery = `SELECT * from users where report_count > = 0`;
			const existingUser: Array<any> = await POSTGRESDB.sequelize.query(selectQuery, {
				type: QueryTypes.SELECT,
				transaction
			});
			await transaction.commit();
			return response.status(200).json(existingUser);
		} catch (error) {
			if (transaction) transaction.rollback();
			next(error);
		}
	}

	static async getGoogleLoginCTRL(req: any, res: Response, next: NextFunction) {
		try {
			const payload = {
				id: req.user._id,
				email: req.user.email
			};
			const accessToken = JWT.sign(payload, process.env.JWT_SECRET_KEY!, {
				expiresIn: '12h'
			});
			const refreshToken = JWT.sign(payload, process.env.JWT_SECRET_KEY!, {
				expiresIn: '3d'
			});
			return res.status(200).json({
				userDetails: req.user,
				accessToken,
				refreshToken
			});
		} catch (error) {
			next(error);
		}
	}
	static async forgotPasswordCTRL(request: Request, response: Response, next: NextFunction) {
		const transaction = await POSTGRESDB.sequelize.transaction();
		try {
			const { email } = request.body;
			if (!email) throw new HttpException(400, 'email not found');
			const selectQuery = `SELECT * from users where email:=userEmail`;
			const existingUser: Array<any> = await POSTGRESDB.sequelize.query(selectQuery, {
				type: QueryTypes.SELECT,
				replacements: { userEmail: email },
				transaction
			});
			// const isUserExists = await UserModel.findOne({ email });
			if (!existingUser || existingUser?.length === 0) throw new HttpException(400, 'User not found');
			const forgotPasswordOTP = UtilsMain.generateOTP();
			const mailOptions: SendMailOptions = UtilsMain.GetMailOptions({
				subject: `Aahare Forgot Password`,
				to: email,
				expirationTime: 60,
				name: existingUser?.[0]?.user_name,
				otp: forgotPasswordOTP
			});
			UtilsMain.sendMailMethod(mailOptions)
				.then(async (res) => {
					const otpInsertQuery = `insert into otp_table(email,otp_generation_time,otp_expiry_time,otp_status,otp_type,otp_value,user_id,created_at)
					values(:email,:otp_generation_time,:otp_expiry_time,:otp_status,:otp_type,:otp_value,:userId,'${Date.now()}')`;
					const otpDetails: Array<any> = await POSTGRESDB.sequelize.query(otpInsertQuery, {
						type: QueryTypes.INSERT,
						replacements: {
							email: existingUser?.[0].email,
							otp_generation_time: Date.now(),
							otp_expiry_time: Date.now() + 60 * 1000,
							otp_status: OTPStatusEnum.UNUSED,
							otp_type: OTPTypeEnum.FORGOTPASSWORD,
							otp_value: forgotPasswordOTP,
							userId: existingUser?.[0].id
						},
						transaction
					});
					await transaction.commit();
					return response.status(200).json({ message: 'OTP sent successfully' });
				})
				.catch(() => {
					throw new HttpException(400, 'Something went wrong');
				});
		} catch (error) {
			if (transaction) transaction.rollback();
			next(error);
		}
	}
	static async setNewPasswordCTRL(request: Request, response: Response, next: NextFunction) {
		const transaction = await POSTGRESDB.sequelize.transaction();
		try {
			const { newPassword, userEmail, confirmCode } = request.body;
			const salt = await bcryptjs.genSalt(10);
			const hashedPassword = await bcryptjs.hash(newPassword, salt);
			const selectQuery = `SELECT * from users where email:=userEmail`;
			const existingUser: Array<any> = await POSTGRESDB.sequelize.query(selectQuery, {
				type: QueryTypes.SELECT,
				replacements: { userEmail: userEmail },
				transaction
			});
			// const isUserExists = await UserModel.findOne({ email: userEmail });
			if (!existingUser || existingUser.length === 0) throw new HttpException(400, 'User does not exists');
			const otpSelectQuery = `select * from otp_table where otp_value=:otpValue and email=:userEmail and otp_type=:otpType user_id=:userId`;
			const otpDetails: Array<any> = await POSTGRESDB.sequelize.query(otpSelectQuery, {
				type: QueryTypes.INSERT,
				replacements: {
					userEmail,
					otpType: OTPTypeEnum.FORGOTPASSWORD,
					otp_value: confirmCode,
					userId: existingUser?.[0].id
				},
				transaction
			});
			// const otpMaster = await otpMasterModel.findOne({
			// 	$and: [{ otpVal: confirmCode }, { userId: isUserExists._id }, { type: OTPMasterEnum.forgotPassword }]
			// });
			if (!otpDetails || otpDetails.length === 0) throw new HttpException(400, 'OTP does not valid');
			if (new Date(otpDetails?.[0].otp_expiry_time).getTime() - Date.now() > 60000) {
				const updateOTPQuery = `update otp_table set otp_status='${OTPStatusEnum.EXPIRES}' where otp_value=:otp and email = :email user_id = :userId  and otp_type='${OTPTypeEnum.FORGOTPASSWORD}'`;
				await POSTGRESDB.sequelize.query(updateOTPQuery, {
					replacements: { otp: confirmCode, email: userEmail, userId: existingUser?.[0].id },
					type: QueryTypes.UPDATE,
					transaction
				});
				await transaction.commit();
				return response.status(400).json({ message: 'OTP EXpires' });
			}
			const updateUserPasswordQuery = `update users set password=:password where id=:userId`;
			await POSTGRESDB.sequelize.query(updateUserPasswordQuery, {
				replacements: { password: hashedPassword, userId: existingUser?.[0].id },
				type: QueryTypes.UPDATE,
				transaction
			});
			await transaction.commit();
			return response.status(200).json({ message: 'Password changed successfully' });
		} catch (error) {
			if (transaction) transaction.rollback();
			next(error);
		}
	}
}
