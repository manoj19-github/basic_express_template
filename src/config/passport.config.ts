import { config } from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import { QueryTypes } from 'sequelize';
import POSTGRESDB from '../config/configPG';
import { UtilsMain } from '../utils';

config({ path: '.env.dev' });
const opts: any = {
	jwtFromRequest: '',
	secretOrKey: ''
};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET_KEY;

passport.use(
	new JWTStrategy(opts, async (jwt_payload, done) => {
		const transaction = await POSTGRESDB.sequelize.transaction();
		try {
			const selectQuery = `select * from users where id = ${jwt_payload.id}`;
			const result = await POSTGRESDB.sequelize.query(selectQuery, { transaction });
			await transaction.commit();
			if (!!result && result.length > 0) return done(null, result?.[0]);
			return done(null, false);
		} catch (error) {
			if (transaction) transaction.rollback();
			return done(null, false);
		}
	})
);

passport.use(
	new GoogleStrategy(
		{
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
			clientID: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!
		},
		async (req: any, accessToken: any, refreshToken: any, profile: any, done: any) => {
			const transaction = await POSTGRESDB.sequelize.transaction();
			try {
				const selectQuery = `select * from users where googleId = '${profile.id}'`;
				const result = await POSTGRESDB.sequelize.query(selectQuery, { type: QueryTypes.SELECT, transaction });
				await transaction.commit();
				if (result && result.length) return done(null, result?.[0]);
				else {
					const hashedPassword = await UtilsMain.hashedPassword(profile.id);
					const insertQuery = `INSERT INTO users(name,email,password,googleId)
					VALUES ('${profile.name.givenName} ${profile.name.familyName}','${profile.emails[0]?.value}','${hashedPassword}','${profile.id}') returning *`;
					const result = await POSTGRESDB.sequelize.query(insertQuery, {
						type: QueryTypes.INSERT,
						transaction
					});
					await transaction.commit();
					return done(null, result?.[0]);
				}
			} catch (error) {
				if (transaction) transaction.rollback();
				done(error, null);
			}
		}
	)
);

passport.serializeUser((user: any, done) => {
	return done(null, user?._id);
});
passport.deserializeUser(async (id, done) => {
	const transaction = await POSTGRESDB.sequelize.transaction();
	try {
		// const _userExists = await UserModel.findById(id);
		const selectQuery = `select * from users where id = ${id}`;
		const result = await POSTGRESDB.sequelize.query(selectQuery, {
			type: QueryTypes.SELECT,
			transaction
		});
		await transaction.commit();

		done(null, result?.[0]);
	} catch (error) {
		if (transaction) transaction.rollback();
		done(error, null);
	}
});
