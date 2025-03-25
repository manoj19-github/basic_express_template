export interface UserInterface {
	id: number;
	email: string;
	password: string;
	user_name: string;
	termination_date?: Date;
	role_id: number;
	address_id: number;
	phone_number?: string;
	is_email_verified: boolean;
	avatar?: string;
	is_enabled?: boolean;
	user_type: string;
	is_super_admin?: boolean;
	role_mapper_id: number;
	is_registered: boolean;
	created_at: Date;
	updated_at?: Date;
	report_count?: number;
}