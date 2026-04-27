import XLSX from 'xlsx';
import { AttendanceRepository } from "../../repository/attendance.repository";
import { LocationRepository } from "../../repository/location.repository";
import { UserRepository } from "../../repository/user.repository";

export class AdminService {
	static async getAllUsers(page: number, limit: number) {
		const offset = (page - 1) * limit;
		const data = await UserRepository.findAll(limit, offset);
		const countResult = await UserRepository.countAll();
		const total = Number(countResult[0]?.count || 0);

		return {
			data,
			pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
		};
	}

	static async getUserLocationHistory(userId: string, startDate: string, endDate: string) {
		return LocationRepository.findByUserIdAndDateRange(userId, startDate, endDate);
	}

	static async generateMonthlyMISReport(startDate: string, endDate: string) {
		const reportData = await AttendanceRepository.getReport(startDate, endDate);

		const worksheet = XLSX.utils.json_to_sheet(reportData.map((row: any) => ({
			'Employee ID': row.user_id,
			'Employee Name': row.full_name,
			'Date': row.date,
			'Check In': row.check_in_time,
			'Check Out': row.check_out_time,
			'Working Hours': row.working_hours
		})));

		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'MIS Report');

		return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
	}
}