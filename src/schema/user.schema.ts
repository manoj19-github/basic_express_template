// schema/user.schema.ts
import mongoose, { Document, Schema, Model, ClientSession } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
	comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
	findByEmail(email: string, session?: ClientSession): Promise<IUser | null>;
	findByCredentials(email: string, password: string, session?: ClientSession): Promise<IUser>;
	emailExists(email: string, session?: ClientSession): Promise<boolean>;
	getUsersPaginated(page: number, limit: number, session?: ClientSession): Promise<IUser[]>;
	searchByName(searchTerm: string, session?: ClientSession): Promise<IUser[]>;
	findByEmails(emails: string[], session?: ClientSession): Promise<IUser[]>;
	createUser(userData: { name: string; email: string; password: string }, session?: ClientSession): Promise<IUser>;
}

const UserSchema: Schema<IUser> = new Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
			minlength: 2,
			maxlength: 50
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/, 'Invalid email format'],
			index: true
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: 6,
			select: false
		}
	},
	{
		timestamps: true,
		versionKey: false,
		toJSON: {
			transform: function (doc, ret) {
				delete ret.password;
				return ret;
			}
		}
	}
);

// Password hashing middleware
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	try {
		const salt = await bcryptjs.genSalt(12);
		this.password = await bcryptjs.hash(this.password, salt);
		next();
	} catch (error: any) {
		next(error);
	}
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
	return bcryptjs.compare(candidatePassword, this.password);
};

// Static Methods with Transaction Support

UserSchema.statics.findByEmail = function (email: string, session?: ClientSession): Promise<IUser | null> {
	const query = this.findOne({ email: email.toLowerCase() });
	if (session) query.session(session);
	return query.exec();
};

UserSchema.statics.findByCredentials = async function (email: string, password: string, session?: ClientSession): Promise<IUser> {
	const query = this.findOne({ email: email.toLowerCase() }).select('+password');
	if (session) query.session(session);

	const user = await query.exec();

	if (!user) {
		throw new Error('Invalid email or password');
	}

	const isPasswordMatch = await user.comparePassword(password);
	if (!isPasswordMatch) {
		throw new Error('Invalid email or password');
	}

	return user;
};

UserSchema.statics.emailExists = async function (email: string, session?: ClientSession): Promise<boolean> {
	const query = this.findOne({ email: email.toLowerCase() });
	if (session) query.session(session);

	const user = await query.exec();
	return !!user;
};

UserSchema.statics.getUsersPaginated = function (page: number = 1, limit: number = 10, session?: ClientSession): Promise<IUser[]> {
	const skip = (page - 1) * limit;
	const query = this.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

	if (session) query.session(session);
	return query.exec();
};

UserSchema.statics.searchByName = function (searchTerm: string, session?: ClientSession): Promise<IUser[]> {
	const query = this.find({
		name: { $regex: searchTerm, $options: 'i' }
	}).limit(10);

	if (session) query.session(session);
	return query.exec();
};

UserSchema.statics.findByEmails = function (emails: string[], session?: ClientSession): Promise<IUser[]> {
	const lowerCaseEmails = emails.map((email) => email.toLowerCase());
	const query = this.find({ email: { $in: lowerCaseEmails } });

	if (session) query.session(session);
	return query.exec();
};

UserSchema.statics.createUser = async function (
	userData: { name: string; email: string; password: string },
	session: ClientSession
): Promise<IUser> {
	const user = new this(userData);
	await user.save({ session });
	return user;
};

export default mongoose.model<IUser, IUserModel>('User', UserSchema);
