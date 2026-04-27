/**
 * Checks if the given date falls within working hours.
 * Default: Monday–Friday, 09:00–18:00
 */
export const isWithinWorkingHours = (date: Date): boolean => {
	const day = date.getDay(); // 0 = Sunday, 6 = Saturday
	if (day === 0 || day === 6) return false;

	const hour = date.getHours();
	const minute = date.getMinutes();
	const timeDecimal = hour + minute / 60;

	return timeDecimal >= 9 && timeDecimal < 18;
};