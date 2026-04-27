import { AttendanceRepository } from '../../repository/attendance.repository';

export class AttendanceService {
	static async getHistory(userId: string, page: number, limit: number) {
		const offset = (page - 1) * limit;
		return AttendanceRepository.findByUserId(userId, limit, offset);
	}

	static async getReport(userId: string, startDate: string, endDate: string) {
		return AttendanceRepository.findByDateRange(userId, startDate, endDate);
	}

	static async getDailyWorkingHoursReport(startDate: string, endDate: string) {
		return AttendanceRepository.getReport(startDate, endDate);
	}
}