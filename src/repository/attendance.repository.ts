import { QueryTypes } from 'sequelize';
import { executeQuery } from '../utils/executeQuery.util';

export class AttendanceRepository {
	static async upsertCheckIn(userId: string, checkInTime: Date, transaction?: any) {
		const existing = await executeQuery<any[]>({
			query: `
        SELECT id, check_in_time FROM attendance
        WHERE user_id = :userId AND date = CURRENT_DATE
        LIMIT 1
      `,
			replacements: { userId },
			type: QueryTypes.SELECT,
			transaction
		});

		if (existing.length > 0 && existing[0].check_in_time) return existing;

		if (existing.length > 0) {
			return executeQuery({
				query: `UPDATE attendance SET check_in_time = :checkInTime WHERE id = :id`,
				replacements: { checkInTime, id: existing[0].id },
				type: QueryTypes.UPDATE,
				transaction
			});
		}

		return executeQuery({
			query: `
        INSERT INTO attendance (id, user_id, date, check_in_time)
        VALUES (gen_random_uuid(), :userId, CURRENT_DATE, :checkInTime)
      `,
			replacements: { userId, checkInTime },
			type: QueryTypes.INSERT,
			transaction
		});
	}

	static async updateCheckOut(userId: string, checkOutTime: Date, transaction?: any) {
		return executeQuery({
			query: `
        UPDATE attendance
        SET check_out_time = :checkOutTime
        WHERE user_id = :userId AND date = CURRENT_DATE AND check_out_time IS NULL
      `,
			replacements: { userId, checkOutTime },
			type: QueryTypes.UPDATE,
			transaction
		});
	}

	static async findByUserId(userId: string, limit: number, offset: number) {
		return executeQuery<any[]>({
			query: `
        SELECT id, date, check_in_time, check_out_time, created_at
        FROM attendance WHERE user_id = :userId
        ORDER BY date DESC LIMIT :limit OFFSET :offset
      `,
			replacements: { userId, limit, offset },
			type: QueryTypes.SELECT
		});
	}

	static async findByDateRange(userId: string, startDate: string, endDate: string) {
		return executeQuery<any[]>({
			query: `
        SELECT id, date, check_in_time, check_out_time, created_at
        FROM attendance
        WHERE user_id = :userId AND date BETWEEN :startDate AND :endDate
        ORDER BY date DESC
      `,
			replacements: { userId, startDate, endDate },
			type: QueryTypes.SELECT
		});
	}

	static async getReport(startDate: string, endDate: string) {
		return executeQuery<any[]>({
			query: `
        SELECT
          a.user_id, u.full_name, a.date,
          a.check_in_time, a.check_out_time,
          CASE
            WHEN a.check_out_time IS NOT NULL THEN
              ROUND(EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time)) / 3600, 2)
            ELSE NULL
          END as working_hours
        FROM attendance a
        JOIN users u ON u.id = a.user_id
        WHERE a.date BETWEEN :startDate AND :endDate
        ORDER BY a.date DESC, u.full_name
      `,
			replacements: { startDate, endDate },
			type: QueryTypes.SELECT
		});
	}
}