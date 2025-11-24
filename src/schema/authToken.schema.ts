// schema/AuthToken.schema.ts
import mongoose, { Document, Schema, Model, ClientSession } from "mongoose";

export interface IAuthToken extends Document {
  userId: mongoose.Types.ObjectId;
  accessAuthToken: string;
  refreshAuthToken: string;
  deviceId: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    acceptLanguage: string;
    platform: string;
    lastAccessed: Date;
  };
  isActive: boolean;
  accessAuthTokenExpires: Date;
  refreshAuthTokenExpires: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthTokenModel extends Model<IAuthToken> {
  createAuthToken(AuthTokenData: {
    userId: mongoose.Types.ObjectId;
    accessAuthToken: string;
    refreshAuthToken: string;
    deviceId: string;
    deviceInfo: {
      userAgent: string;
      ipAddress: string;
      acceptLanguage: string;
      platform: string;
    };
  }, session?: ClientSession): Promise<IAuthToken>;

  findByAccessAuthToken(accessAuthToken: string): Promise<IAuthToken | null>;
  findByRefreshAuthToken(refreshAuthToken: string): Promise<IAuthToken | null>;
  findActiveAuthTokensByUser(userId: mongoose.Types.ObjectId): Promise<IAuthToken[]>;
  deactivateAllUserAuthTokens(userId: mongoose.Types.ObjectId, session?: ClientSession): Promise<void>;
  deactivateAuthToken(AuthTokenId: mongoose.Types.ObjectId, session?: ClientSession): Promise<void>;
  deactivateOtherUserAuthTokens(userId: mongoose.Types.ObjectId, currentDeviceId: string, session?: ClientSession): Promise<void>;
  isUserLoggedInOnAnotherDevice(userId: mongoose.Types.ObjectId, currentDeviceId: string): Promise<boolean>;
}

const AuthTokenSchema: Schema<IAuthToken> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    accessAuthToken: {
      type: String,
      required: true,
      index: true
    },
    refreshAuthToken: {
      type: String,
      required: true,
      index: true
    },
    deviceId: {
      type: String,
      required: true,
      index: true
    },
    deviceInfo: {
      userAgent: String,
      ipAddress: String,
      acceptLanguage: String,
      platform: String,
      lastAccessed: {
        type: Date,
        default: Date.now
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    accessAuthTokenExpires: {
      type: Date,
      required: true
    },
    refreshAuthTokenExpires: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Static Methods
AuthTokenSchema.statics.isUserLoggedInOnAnotherDevice = async function(
  userId: mongoose.Types.ObjectId,
  currentDeviceId: string
): Promise<boolean> {
  const activeAuthToken = await this.findOne({
    userId,
    isActive: true,
    deviceId: { $ne: currentDeviceId }, // Exclude current device
    accessAuthTokenExpires: { $gt: new Date() }
  });

  return !!activeAuthToken;
};

AuthTokenSchema.statics.deactivateOtherUserAuthTokens = async function(
  userId: mongoose.Types.ObjectId,
  currentDeviceId: string,
  session?: ClientSession
): Promise<void> {
  const updateOp = this.updateMany(
    {
      userId,
      isActive: true,
      deviceId: { $ne: currentDeviceId } // Deactivate all except current device
    },
    { isActive: false }
  );

  if (session) {
    await updateOp.session(session);
  }

  await updateOp.exec();
};

AuthTokenSchema.statics.findActiveAuthTokensByUser = function(
  userId: mongoose.Types.ObjectId
): Promise<IAuthToken[]> {
  return this.find({
    userId,
    isActive: true,
    accessAuthTokenExpires: { $gt: new Date() }
  }).sort({ createdAt: -1 }).exec();
};

AuthTokenSchema.statics.createAuthToken = async function (
	AuthTokenData: {
		userId: mongoose.Types.ObjectId;
		accessAuthToken: string;
		refreshAuthToken: string;
		deviceId: string;
		deviceInfo: {
			userAgent: string;
			ipAddress: string;
			acceptLanguage: string;
			platform: string;
		};
	},
	session?: ClientSession
): Promise<IAuthToken> {
	const { userId, accessAuthToken, refreshAuthToken, deviceId, deviceInfo } = AuthTokenData;

	const accessAuthTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
	const refreshAuthTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

	const doc = new this({
		userId,
		accessAuthToken,
		refreshAuthToken,
		deviceId,
		deviceInfo,
		accessAuthTokenExpires,
		refreshAuthTokenExpires
	});

	if (session) {
		await doc.save({ session });
	} else {
		await doc.save();
	}

	return doc;
};

AuthTokenSchema.statics.deactivateAllUserAuthTokens = async function (
	userId: mongoose.Types.ObjectId,
	session?: ClientSession
): Promise<void> {
	if (session) {
		await this.updateMany({ userId, isActive: true }, { isActive: false }).session(session);
	} else {
		await this.updateMany({ userId, isActive: true }, { isActive: false });
	}
};


export default mongoose.model<IAuthToken, IAuthTokenModel>('AuthToken', AuthTokenSchema );
