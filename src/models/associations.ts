import { Attendance } from './attendance.model';
import { Device } from './device.model';
import { Location } from './location.model';
import { User } from './user.model';

User.hasOne(Device, { foreignKey: 'user_id', as: 'device' });
Device.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Attendance, { foreignKey: 'user_id', as: 'attendances' });
Attendance.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Location, { foreignKey: 'user_id', as: 'locations' });
Location.belongsTo(User, { foreignKey: 'user_id', as: 'user' });